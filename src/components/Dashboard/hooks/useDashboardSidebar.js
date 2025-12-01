import { useState, useCallback } from 'react';
import {
    getSidebarTitle,
    getSidebarSubtitle,
    getSidebarIcon,
    getSidebarItems,
    getSidebarRenderItem
} from '../utils/sidebarUtils.jsx';

export const useDashboardSidebar = (data, t, formatCurrency) => {
    const {
        stats,
        allOrdersFromStats,
        allProducts,
        allCustomers,
        mostViewedProducts,
        mostOrderedProducts,
        mostSoldProducts,
        refetchCustomers
    } = data;

    const [isLowStockSidebarOpen, setIsLowStockSidebarOpen] = useState(false);
    const [sidebarState, setSidebarState] = useState({
        type: null,
        isOpen: false,
        monthData: null,
        filteredOrders: [],
    });

    const handleCardClick = useCallback((type) => {
        setSidebarState({ type, isOpen: true });

        // Lazy load customers if needed
        if (type === 'customers') {
            refetchCustomers();
        }
    }, [refetchCustomers]);

    const handleLowStockClick = useCallback(() => {
        setIsLowStockSidebarOpen(true);
    }, []);

    const handleBarClick = useCallback((monthData) => {
        const now = new Date();
        const currentYear = now.getFullYear();
        const selectedMonth = monthData.month;

        const filteredOrders = allOrdersFromStats.filter(order => {
            if (order.status !== 'completed') return false;
            const orderDate = new Date(order.date_created);
            return orderDate.getFullYear() === currentYear &&
                orderDate.getMonth() + 1 === selectedMonth;
        });

        setSidebarState({
            type: 'chartOrders',
            isOpen: true,
            monthData: monthData,
            filteredOrders: filteredOrders
        });
    }, [allOrdersFromStats]);

    const handleSidebarClose = useCallback(() => {
        setSidebarState({ type: null, isOpen: false, monthData: null, filteredOrders: [] });
    }, []);

    // Prepare props for the DashboardSidebar component
    const sidebarProps = {
        isOpen: sidebarState.isOpen,
        onClose: handleSidebarClose,
        title: getSidebarTitle(sidebarState.type, t, sidebarState.monthData),
        subtitle: getSidebarSubtitle(
            sidebarState.type,
            t,
            stats,
            allOrdersFromStats,
            allProducts,
            allCustomers,
            mostViewedProducts,
            mostOrderedProducts,
            mostSoldProducts,
            sidebarState.filteredOrders
        ),
        icon: getSidebarIcon(sidebarState.type),
        items: getSidebarItems(
            sidebarState.type,
            allOrdersFromStats,
            allProducts,
            allCustomers,
            mostViewedProducts,
            mostOrderedProducts,
            mostSoldProducts,
            sidebarState.filteredOrders
        ),
        renderItem: getSidebarRenderItem(sidebarState.type, t),
        formatCurrency
    };

    return {
        isLowStockSidebarOpen,
        setIsLowStockSidebarOpen,
        sidebarState,
        handleCardClick,
        handleLowStockClick,
        handleBarClick,
        handleSidebarClose,
        sidebarProps
    };
};
