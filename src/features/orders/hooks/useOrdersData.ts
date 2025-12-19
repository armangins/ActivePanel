import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersService } from '../api/orders.service';
import { OrdersResponse, Order } from '../types';
import { useSettings } from '@/features/settings';

interface UseOrdersParams {
    page?: number;
    per_page?: number;
    search?: string;
    status?: string;
    enabled?: boolean;
}

export const useOrdersData = ({ page = 1, per_page = 10, search = '', status = 'all', enabled = true }: UseOrdersParams = {}) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<OrdersResponse>({
        queryKey: ['orders', page, per_page, search, status],
        queryFn: () => ordersService.getOrders({ page, per_page, search, status }),
        enabled: isConfigured && enabled,
        staleTime: 1 * 60 * 1000, // 1 minute stale time for orders as they change frequently
        placeholderData: (previousData) => previousData
    });
};

export const useOrderDetail = (id: number | null) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<Order>({
        queryKey: ['order', id],
        queryFn: () => ordersService.getOrderById(id!),
        enabled: isConfigured && !!id
    });
};

export const useOrderStatusCounts = () => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery<Record<string, number>>({
        queryKey: ['order-status-counts'],
        queryFn: () => ordersService.getStatusCounts(),
        enabled: isConfigured,
        staleTime: 5 * 60 * 1000
    });
};

export const useUpdateOrder = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, status }: { id: number; status: string }) =>
            ordersService.updateOrderStatus(id, status),
        onSuccess: (data) => {
            queryClient.invalidateQueries({ queryKey: ['orders'] });
            queryClient.invalidateQueries({ queryKey: ['order', data.id] });
            queryClient.invalidateQueries({ queryKey: ['order-status-counts'] });
        }
    });
};
