import { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../services/woocommerce';

/**
 * Hook to track new orders in real-time
 * Checks for new orders every 30 seconds
 * Notifications are kept in memory until manually deleted or page reload
 * @returns {number} Count of new orders since last check
 */
const useNewOrdersCount = () => {
  // Initialize with empty state (no persistence)
  const [newOrdersCount, setNewOrdersCount] = useState(0);
  const [newOrders, setNewOrders] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [hasError, setHasError] = useState(false);
  const lastCheckedDateRef = useRef(null);
  const intervalRef = useRef(null);

  useEffect(() => {
    // Initial check - get the latest order date
    const initialize = async () => {
      try {
        setIsLoading(true);
        setHasError(false);

        const orders = await ordersAPI.getAll({
          per_page: 1,
          orderby: 'date',
          order: 'desc'
        });

        if (orders && Array.isArray(orders) && orders.length > 0) {
          // Store the date of the latest order
          const orderDate = new Date(orders[0].date_created || orders[0].date_created_gmt);
          if (!isNaN(orderDate.getTime())) {
            lastCheckedDateRef.current = orderDate.getTime();
          }
        }
        setIsLoading(false);
        setHasError(false);
      } catch (error) {
        // Failed to initialize - will retry on next check
        setIsLoading(false);
        setHasError(true);
        return;
      }
    };

    initialize();

    // Check for new orders every 30 seconds
    const checkNewOrders = async () => {
      try {
        setHasError(false);

        const orders = await ordersAPI.getAll({
          per_page: 20, // Check last 20 orders
          orderby: 'date',
          order: 'desc'
        });

        // Validate response
        if (!orders || !Array.isArray(orders) || orders.length === 0) {
          return;
        }

        // If we don't have a last checked date yet, set it to the latest order
        if (lastCheckedDateRef.current === null) {
          const orderDate = new Date(orders[0].date_created || orders[0].date_created_gmt);
          if (!isNaN(orderDate.getTime())) {
            lastCheckedDateRef.current = orderDate.getTime();
          }
          return;
        }

        // Count new orders (orders created after last checked date)
        const newOrdersFound = orders.filter(order => {
          try {
            const orderDate = new Date(order.date_created || order.date_created_gmt);
            if (isNaN(orderDate.getTime())) {
              return false;
            }
            return orderDate.getTime() > lastCheckedDateRef.current;
          } catch (e) {
            return false;
          }
        });

        if (newOrdersFound.length > 0) {
          // Add new orders to the list (most recent first - new orders are already in desc order)
          setNewOrders(prev => {
            // Deduplicate by order ID
            const existingIds = new Set(prev.map(o => o.id));
            const uniqueNewOrders = newOrdersFound
              .filter(o => o.id && !existingIds.has(o.id))
              .map(order => ({ ...order, read: false })); // Mark new orders as unread

            const updatedOrders = [...uniqueNewOrders, ...prev];

            // Update count to only include unread notifications
            const unreadCount = updatedOrders.filter(o => !o.read).length;
            setNewOrdersCount(unreadCount);

            return updatedOrders;
          });

          // Update last checked date to the latest order
          const latestOrderDate = new Date(orders[0].date_created || orders[0].date_created_gmt);
          if (!isNaN(latestOrderDate.getTime())) {
            lastCheckedDateRef.current = latestOrderDate.getTime();
          }
        }
      } catch (error) {
        // Set error state but don't throw - will retry on next check
        setHasError(true);
        return;
      }
    };

    // Check immediately, then every 30 seconds
    checkNewOrders();
    intervalRef.current = setInterval(checkNewOrders, 30000); // 30 seconds

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  // Mark a notification as read
  const markAsRead = (orderId) => {
    setNewOrders(prev => {
      const updatedOrders = prev.map(order =>
        order.id === orderId ? { ...order, read: true } : order
      );

      // Update count to only include unread notifications
      const unreadCount = updatedOrders.filter(o => !o.read).length;
      setNewOrdersCount(unreadCount);

      return updatedOrders;
    });
  };

  // Mark all notifications as read
  const markAllAsRead = () => {
    setNewOrders(prev => {
      const updatedOrders = prev.map(order => ({ ...order, read: true }));

      // Update count to 0 (all read)
      setNewOrdersCount(0);

      return updatedOrders;
    });
  };

  // Mark a notification as unread
  const markAsUnread = (orderId) => {
    setNewOrders(prev => {
      const updatedOrders = prev.map(order =>
        order.id === orderId ? { ...order, read: false } : order
      );

      // Update count to only include unread notifications
      const unreadCount = updatedOrders.filter(o => !o.read).length;
      setNewOrdersCount(unreadCount);

      return updatedOrders;
    });
  };

  // Remove a specific order from notifications
  const removeOrder = (orderId) => {
    setNewOrders(prev => {
      const updatedOrders = prev.filter(order => order.id !== orderId);

      // Update count to only include unread notifications
      const unreadCount = updatedOrders.filter(o => !o.read).length;
      setNewOrdersCount(unreadCount);

      return updatedOrders;
    });
  };

  // Clear all notifications
  const clearAllNotifications = () => {
    setNewOrdersCount(0);
    setNewOrders([]);
  };

  // Reset count when user navigates to orders page (optional - can be called manually)
  const resetCount = () => {
    setNewOrdersCount(0);
    setNewOrders([]);
    // Also reset the last checked date to current time to avoid counting old orders
    lastCheckedDateRef.current = Date.now();
  };

  // No automatic cleanup - notifications stay until user manually deletes them

  return {
    newOrdersCount,
    newOrders,
    resetCount,
    removeOrder,
    clearAllNotifications,
    markAsRead,
    markAsUnread,
    markAllAsRead,
    isLoading,
    hasError
  };
};

export default useNewOrdersCount;

