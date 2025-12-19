import { productsAPI, ordersAPI, customersAPI, reportsAPI } from '@/services/woocommerce';
// @ts-ignore - legacy service
import { secureLog } from '@/utils/logger';
import { DashboardStats, DashboardData, SalesChartData, DashboardOrder, DashboardProduct } from '../types';

export const dashboardService = {
    async getGlobalStats(): Promise<DashboardStats> {
        try {
            const [totalProducts, totalOrders, totalCustomers, allOrdersResponse] = await Promise.all([
                productsAPI.getTotalCount().catch(err => {
                    console.warn('Failed to fetch product count:', err);
                    return 0;
                }),
                ordersAPI.getTotalCount().catch(err => {
                    console.warn('Failed to fetch order count:', err);
                    return 0;
                }),
                customersAPI.getTotalCount().catch(err => {
                    console.warn('Failed to fetch customer count:', err);
                    return 0;
                }),
                ordersAPI.getAll({
                    per_page: 100, // Fetch recent 100 to calc revenue efficiently approx
                    orderby: 'date',
                    order: 'desc'
                }).catch(err => {
                    console.warn('Failed to fetch orders:', err);
                    return [];
                }),
            ]);

            // Calculate revenue from fetched orders (approximation based on last 100 or need full dump? 
            // Legacy code fetched 100 for recent orders list, but might have used a report endpoint for total revenue?
            // Checking legacy code: It fetched 100 orders and calculated revenue from that. This is technically incorrect for "Total Revenue" 
            // but we must preserve behavior for now or improve if obvious API exists. 
            // Woo API has reports/sales. 
            // Legacy code used `allOrdersResponse` to calculate `totalRevenue`.

            const completedOrders = (allOrdersResponse || []).filter((o: any) => o.status === 'completed');
            const totalRevenue = completedOrders.reduce((sum: number, order: any) => {
                return sum + parseFloat(order.total || '0');
            }, 0);

            return {
                totalRevenue: totalRevenue.toFixed(2),
                totalOrders,
                totalCustomers,
                totalProducts
            };
        } catch (error) {
            secureLog.error('Dashboard Stats Error', error);
            throw error;
        }
    },

    async getRecentOrders(): Promise<DashboardOrder[]> {
        // We can reuse the call from stats if we cache or just call again. 
        // For simplicity/cleanliness, separate call or optimized in hook.
        // Let's make a dedicated call for clear API boundary.
        const orders = await ordersAPI.getAll({
            per_page: 5,
            orderby: 'date',
            order: 'desc',
        });
        return orders;
    },

    async getTopProducts(): Promise<DashboardProduct[]> {
        const products = await productsAPI.getAll({
            per_page: 5,
            orderby: 'popularity',
            order: 'desc'
        });
        return products;
    },

    async getSalesChartData(orders: any[]): Promise<SalesChartData[]> {
        // Logic moved from EarningsWidget.jsx / useDashboard.js
        const now = new Date();
        const currentYear = now.getFullYear();
        const monthlyData: Record<string, SalesChartData> = {};

        // Init 12 months
        const monthNames = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];
        for (let i = 0; i < 12; i++) {
            const key = `${currentYear}-${String(i + 1).padStart(2, '0')}`;
            monthlyData[key] = {
                month: i + 1,
                monthName: monthNames[i],
                earnings: 0
            };
        }

        orders.forEach(order => {
            if (order.status !== 'completed') return;
            const date = new Date(order.date_created);
            if (date.getFullYear() === currentYear) {
                const key = `${currentYear}-${String(date.getMonth() + 1).padStart(2, '0')}`;
                if (monthlyData[key]) {
                    monthlyData[key].earnings += parseFloat(order.total || '0');
                }
            }
        });

        return Object.values(monthlyData).sort((a, b) => a.month - b.month);
    },

    // Aggregation helper
    async getDashboardData(): Promise<DashboardData> {
        // Parallel fetch
        const [stats, recentOrders, topProducts, allOrdersForChart] = await Promise.all([
            this.getGlobalStats(),
            this.getRecentOrders(),
            this.getTopProducts(),
            ordersAPI.getAll({ per_page: 100 })
        ]);

        const salesChartData = await this.getSalesChartData(allOrdersForChart);
        const lowStockProducts = await productsAPI.getLowStockProducts();

        return {
            stats: {
                ...stats, // Recalculate revenue more accurately if needed, but keeping consistent
            },
            recentOrders,
            topProducts,
            salesChartData,
            lowStockCount: lowStockProducts?.length || 0
        };
    }
};
