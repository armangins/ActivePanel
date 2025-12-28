import { useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAuth } from '@/features/auth';
import useNewOrdersCount from '@/hooks/useNewOrdersCount';
import { refreshAllData } from '@/utils/refreshHelpers';
import { message } from 'antd'; // Fallback if MessageContext isn't available globally yet, or use custom hook if preferred. 
// Note: The previous task established MessageContext. Ideally we should use it, 
// but Header might be high up in the tree. Let's use useAuth which is likely safe.
// Wait, Header.tsx didn't use 'message' from antd directly, it used it implicitly or handled errors via catch.
// I won't add message here unless needed.

export const useHeaderLogic = () => {
    const { t, isRTL, formatCurrency } = useLanguage();
    const { user, logout } = useAuth();
    const navigate = useNavigate();

    // Local UI State
    const [isRefreshing, setIsRefreshing] = useState(false);
    const [selectedOrder, setSelectedOrder] = useState<any>(null);
    const [notificationOpen, setNotificationOpen] = useState(false);
    const [mobileSearchOpen, setMobileSearchOpen] = useState(false);

    // Data Hooks
    const {
        newOrdersCount,
        newOrders,
        removeOrder,
        clearAllNotifications,
        markAsRead,
        markAllAsRead,
        isLoading: isLoadingNotifications
    } = useNewOrdersCount();

    // Handlers
    const handleLogout = useCallback(async () => {
        try {
            await logout();
            navigate('/login', { replace: true });
        } catch (error) {
            console.error('Logout failed', error);
            navigate('/login', { replace: true });
        }
    }, [logout, navigate]);

    const handleRefresh = useCallback(async () => {
        setIsRefreshing(true);
        try {
            await refreshAllData();
        } catch (error) {
            console.error('Refresh failed', error);
        } finally {
            setIsRefreshing(false);
        }
    }, []);

    const handleOrderClick = useCallback((orderId: string | number) => {
        const latestOrder = newOrders.find((o: any) => o.id === orderId);
        if (!latestOrder) return;
        setSelectedOrder(latestOrder);
        setNotificationOpen(false);
    }, [newOrders]);

    const handleModalClose = useCallback(() => {
        const currentOrder = newOrders.find((o: any) => o.id === selectedOrder?.id);
        if (currentOrder && !currentOrder.read) {
            markAsRead(selectedOrder.id);
        }
        setSelectedOrder(null);
    }, [newOrders, selectedOrder, markAsRead]);

    const handleViewAllOrders = useCallback(() => {
        navigate('/orders');
        setNotificationOpen(false);
    }, [navigate]);

    return {
        // State
        isRefreshing,
        selectedOrder,
        notificationOpen,
        mobileSearchOpen,
        setNotificationOpen,
        setMobileSearchOpen,

        // Data
        user,
        newOrders,
        newOrdersCount,
        isLoadingNotifications,

        // Context/Utils
        t,
        isRTL,
        formatCurrency,

        // Handlers
        handleLogout,
        handleRefresh,
        handleOrderClick,
        handleModalClose,
        handleViewAllOrders,
        removeOrder,
        clearAllNotifications,
        markAllAsRead,
        markAsRead // Exposed if needed by sub-components
    };
};
