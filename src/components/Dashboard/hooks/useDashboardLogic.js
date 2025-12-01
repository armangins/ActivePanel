import { useMemo, useCallback } from 'react';
import { calculatePercentageChange } from '../../../shared/utils';
import {
    useDashboardStats,
    useRecentOrders,
    useDashboardProducts,
    useDashboardOrders,
    useDashboardCustomers,
    useTopSellers,
    useDashboardLowStock,
    useMostSoldProducts,
    useMostOrderedProducts,
    useTopSellersProducts,
    useGA4Traffic,
    useGA4Purchase,
    useGA4AddToCart,
    useGA4Revenue,
} from '../../../hooks/useDashboard';

export const useDashboardLogic = () => {
    // Fetch data using React Query hooks
    const { data: dashboardStatsData, isLoading: loadingStats, error: statsError } = useDashboardStats();
    const { data: recentOrders = [], isLoading: loadingRecentOrders } = useRecentOrders();
    const { data: allProducts = [], isLoading: loadingProducts } = useDashboardProducts();
    const { data: allOrders = [], isLoading: loadingOrders } = useDashboardOrders();
    const { data: topSellersData = [], isLoading: loadingTopSellers } = useTopSellers();
    const { data: lowStockProducts = [], isLoading: loadingLowStock } = useDashboardLowStock();
    const { data: ga4TrafficData } = useGA4Traffic();
    const { data: ga4PurchaseData } = useGA4Purchase();
    const { data: ga4AddToCartData } = useGA4AddToCart();
    const { data: ga4RevenueData } = useGA4Revenue();

    // Load customers only when sidebar is opened (lazy loading)
    const { data: allCustomers = [], refetch: refetchCustomers } = useDashboardCustomers();

    // Compute derived data using useMemo
    const stats = useMemo(() => dashboardStatsData?.stats || {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
    }, [dashboardStatsData]);

    const previousStats = useMemo(() => dashboardStatsData?.previousStats || {
        totalRevenue: 0,
        totalOrders: 0,
        totalCustomers: 0,
        totalProducts: 0,
    }, [dashboardStatsData]);

    const allOrdersFromStats = useMemo(() => dashboardStatsData?.allOrders || [], [dashboardStatsData]);

    // Use computed hooks for product lists
    const mostSoldProducts = useMostSoldProducts(allProducts);
    const mostOrderedProducts = useMostOrderedProducts(allOrdersFromStats, allProducts);
    const mostViewedProducts = useTopSellersProducts(topSellersData, allProducts);

    const lowStockCount = useMemo(() => lowStockProducts?.length || 0, [lowStockProducts]);
    const previousLowStockCount = 0; // Could be tracked if needed

    // Calculate changes
    const calculateChange = useCallback((current, previous) => {
        const result = calculatePercentageChange(current, previous);
        return result ? result.replace('.00', '.0') : null;
    }, []);

    const changes = useMemo(() => ({
        revenue: calculateChange(parseFloat(stats.totalRevenue), previousStats.totalRevenue),
        orders: calculateChange(stats.totalOrders, previousStats.totalOrders),
        customers: null,
        products: null,
        lowStock: calculateChange(lowStockCount, previousLowStockCount),
    }), [stats, previousStats, lowStockCount, previousLowStockCount, calculateChange]);

    // Loading and error states
    const loading = loadingStats;
    const loadingSecondary = loadingProducts || loadingTopSellers || loadingLowStock;
    const error = statsError;

    return {
        // Data
        stats,
        changes,
        recentOrders,
        allOrdersFromStats,
        allProducts,
        allCustomers,
        lowStockProducts,
        lowStockCount,
        mostSoldProducts,
        mostOrderedProducts,
        mostViewedProducts,

        // GA4 Data
        ga4TrafficData,
        ga4PurchaseData,
        ga4AddToCartData,
        ga4RevenueData,

        // States
        loading,
        loadingSecondary,
        error,

        // Actions
        refetchCustomers,
    };
};
