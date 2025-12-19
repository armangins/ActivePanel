import { ordersAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { Order, OrdersResponse } from '../types';

export const ordersService = {
    async getOrders(params: {
        page?: number;
        per_page?: number;
        search?: string;
        status?: string;
    } = {}): Promise<OrdersResponse> {
        try {
            const apiParams = {
                page: params.page || 1,
                per_page: params.per_page || 10,
                search: params.search || '',
                status: params.status !== 'all' ? params.status : undefined,
                orderby: 'date',
                order: 'desc'
            };

            const response = await ordersAPI.list(apiParams);

            return {
                data: response.data as Order[],
                total: response.total || 0,
                totalPages: response.totalPages || 0
            };
        } catch (error) {
            secureLog.error('Error fetching orders:', error);
            throw error;
        }
    },

    async getOrderById(id: number): Promise<Order> {
        try {
            const order = await ordersAPI.get(id);
            return order as Order;
        } catch (error) {
            secureLog.error(`Error fetching order ${id}:`, error);
            throw error;
        }
    },

    async updateOrderStatus(id: number, status: string): Promise<Order> {
        try {
            const order = await ordersAPI.update(id, { status });
            return order as Order;
        } catch (error) {
            secureLog.error(`Error updating order ${id}:`, error);
            throw error;
        }
    },

    async getStatusCounts(): Promise<Record<string, number>> {
        try {
            const statuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded'];
            const counts: Record<string, number> = {};

            // Get total count (approximation or separate call)
            // Simulating for now as per legacy code logic which calls list({per_page:1}) for each status
            // Optimization: We could try to get report data if available, but sticking to legacy logic for safety first.

            const allOrdersData = await ordersAPI.list({ per_page: 1 });
            counts.all = allOrdersData.total || 0;

            await Promise.all(statuses.map(async (status) => {
                try {
                    const statusData = await ordersAPI.list({ status, per_page: 1 });
                    counts[status] = statusData.total || 0;
                } catch {
                    counts[status] = 0;
                }
            }));

            return counts;
        } catch (error) {
            secureLog.error('Error fetching status counts:', error);
            return {};
        }
    }
};
