import { productsAPI, ordersAPI, customersAPI, reportsAPI } from '@/services/woocommerce';
// @ts-ignore - legacy service
import { secureLog } from '@/utils/logger';
import { DashboardStats, DashboardData, SalesChartData, DashboardOrder, DashboardProduct } from '../types';

export const dashboardService = {
    async getGlobalStats(): Promise<DashboardStats> {
        try {
            const [totalProducts, totalOrders, totalCustomers, salesReport] = await Promise.all([
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
                reportsAPI.getSales('year').catch(err => {
                    console.warn('Failed to fetch sales report:', err);
                    return [];
                })
            ]);

            // Calculate revenue from reportsAPI (authoritative source)
            // Report returns array, usually one item for the requested period 'year' or multiple if granular
            // The endpoint /reports/sales with period=year usually returns total_sales for that year
            // If it returns an array of reports, we sum them up or take the first one.
            // WooCommerce REST API /reports/sales returns array.

            let totalRevenue = 0;
            if (Array.isArray(salesReport) && salesReport.length > 0) {
                // Sum up total_sales from all report entries (though usually 1 for 'year')
                totalRevenue = salesReport.reduce((sum: number, report: any) => sum + parseFloat(report.total_sales || '0'), 0);
            }

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
        const response: any = await productsAPI.getAll({
            per_page: 5,
            orderby: 'popularity',
            order: 'desc'
        });
        return response.data || [];
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
        const [stats, recentOrders, topProducts] = await Promise.all([
            this.getGlobalStats(),
            this.getRecentOrders(),
            this.getTopProducts()
        ]);

        // For the chart, we still need some data. The previous code fetched 100 orders.
        // Let's keep fetching orders for the chart separately but maybe optimized?
        // Actually, let's keep it but separate from the stats call to be clean.
        const allOrdersForChart = await ordersAPI.getAll({ per_page: 100 });

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
