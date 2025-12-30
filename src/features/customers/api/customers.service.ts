import { customersAPI, ordersAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { Customer, CustomersResponse } from '../types';

export const customersService = {
    async getCustomers(params: { page?: number; per_page?: number; search?: string } = {}): Promise<CustomersResponse> {
        try {
            const response = await customersAPI.getAll({
                page: params.page || 1,
                per_page: params.per_page || 10,
                search: params.search || '',

            });

            // The legacy API wrapper returns { data, total, totalPages }
            return {
                data: response.data as Customer[],
                total: response.total,
                totalPages: response.totalPages
            };
        } catch (error) {
            secureLog.error('Error fetching customers:', error);
            throw error;
        }
    },

    async getCustomerById(id: number): Promise<Customer> {
        try {
            const customer = await customersAPI.getById(id);
            return customer as Customer;
        } catch (error) {
            secureLog.error(`Error fetching customer ${id}:`, error);
            throw error;
        }
    },

    async getCustomerOrders(customerId: number): Promise<any[]> {
        try {
            const orders = await ordersAPI.list({ customer: customerId, per_page: 10 });
            return orders;
        } catch (error) {
            secureLog.error(`Error fetching orders for customer ${customerId}:`, error);
            return [];
        }
    }
};
