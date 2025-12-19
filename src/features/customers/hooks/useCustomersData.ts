import { useQuery } from '@tanstack/react-query';
import { customersService } from '../api/customers.service';
import { CustomersResponse, Customer } from '../types';
import { useSettings } from '@/features/settings';

interface UseCustomersParams {
    page?: number;
    per_page?: number;
    search?: string;
    enabled?: boolean;
}

export const useCustomersData = ({ page = 1, per_page = 10, search = '', enabled = true }: UseCustomersParams = {}) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<CustomersResponse>({
        queryKey: ['customers', page, per_page, search],
        queryFn: () => customersService.getCustomers({ page, per_page, search }),
        enabled: isConfigured && enabled,
        staleTime: 5 * 60 * 1000,
        placeholderData: (previousData) => previousData // Keep previous data while fetching new page
    });
};

export const useCustomerDetails = (id: number | null) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<Customer>({
        queryKey: ['customer', id],
        queryFn: () => customersService.getCustomerById(id!),
        enabled: isConfigured && !!id,
        staleTime: 10 * 60 * 1000
    });
}
