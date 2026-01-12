import { useState, useEffect, useRef } from 'react';
import { ordersAPI } from '../services/woocommerce';
import { useSocket } from '../contexts/SocketContext';
import { message } from 'antd';

export interface NotificationOrder {
    id: number;
    read: boolean;
    date_created: string;
    [key: string]: any;
}

interface NewOrdersReturn {
    newOrdersCount: number;
    newOrders: NotificationOrder[];
    resetCount: () => void;
    removeOrder: (orderId: number) => void;
    clearAllNotifications: () => void;
    markAsRead: (orderId: number) => void;
    markAsUnread: (orderId: number) => void;
    markAllAsRead: () => void;
    isLoading: boolean;
}

/**
 * Hook to track new orders in real-time
 * Uses Socket.io to receive pushed updates from the backend
 * Notifications are kept in memory until manually deleted or page reload
 * @returns {NewOrdersReturn} Hook state and methods
 */
const useNewOrdersCount = (): NewOrdersReturn => {
    // Initialize with empty state (no persistence)
    const [newOrdersCount, setNewOrdersCount] = useState<number>(0);
    const [newOrders, setNewOrders] = useState<NotificationOrder[]>([]);
    const [isLoading, setIsLoading] = useState<boolean>(true);
    const { socket, isConnected } = useSocket();
    const lastCheckedDateRef = useRef<number | null>(null);

    useEffect(() => {
        // Initial check - get the latest order date to set a baseline
        const initialize = async () => {
            try {
                setIsLoading(true);

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
            } catch (error) {
                // Failed to initialize
                setIsLoading(false);
            }
        };

        initialize();
    }, []);

    // Listen for new orders via Socket.io
    useEffect(() => {
        if (!socket || !isConnected) return;

        const handleNewOrders = (orders: any[]) => {
            if (!orders || !Array.isArray(orders) || orders.length === 0) return;

            console.log('🔔 [SOCKET] Received new orders:', orders);

            // Show toast notification
            message.info(`You have ${orders.length} new order${orders.length > 1 ? 's' : ''}!`);

            setNewOrders((prev) => {
                // Deduplicate by order ID
                const existingIds = new Set(prev.map(o => o.id));
                const uniqueNewOrders = orders
                    .filter((o: any) => o.id && !existingIds.has(o.id))
                    .map((order: any) => ({ ...order, read: false })); // Mark new orders as unread

                const updatedOrders = [...uniqueNewOrders, ...prev];

                // Update count to only include unread notifications
                const unreadCount = updatedOrders.filter(o => !o.read).length;
                setNewOrdersCount(unreadCount);

                return updatedOrders;
            });

            // Update last checked date if needed (optional logic)
            const latestOrder = orders[orders.length - 1]; // Poller sends oldest->newest, or catch any
            if (latestOrder) {
                const latestDate = new Date(latestOrder.date_created).getTime();
                if (latestDate > (lastCheckedDateRef.current || 0)) {
                    lastCheckedDateRef.current = latestDate;
                }
            }
        };

        socket.on('new_orders', handleNewOrders);

        return () => {
            socket.off('new_orders', handleNewOrders);
        };
    }, [socket, isConnected]);

    // Mark a notification as read
    const markAsRead = (orderId: number) => {
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
    const markAsUnread = (orderId: number) => {
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
    const removeOrder = (orderId: number) => {
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

    // Reset count when user navigates to orders page
    const resetCount = () => {
        setNewOrdersCount(0);
        setNewOrders([]);
        lastCheckedDateRef.current = Date.now();
    };

    return {
        newOrdersCount,
        newOrders,
        resetCount,
        removeOrder,
        clearAllNotifications,
        markAsRead,
        markAsUnread,
        markAllAsRead,
        isLoading
    };
};

export default useNewOrdersCount;
