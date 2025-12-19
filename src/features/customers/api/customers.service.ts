import { customersAPI } from '@/services/woocommerce';
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
                _fields: 'id,first_name,last_name,username,email,avatar_url,billing,shipping,date_created,role,orders_count,total_spent'
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
    }
};
