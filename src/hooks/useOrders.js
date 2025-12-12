import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { ordersAPI } from '../services/woocommerce';
import { PAGINATION_DEFAULTS } from '../shared/constants';
import { useWooCommerceSettings } from './useWooCommerceSettings';

const PER_PAGE = PAGINATION_DEFAULTS.ORDERS_PER_PAGE;

// Query keys
export const orderKeys = {
  all: ['orders'],
  lists: () => [...orderKeys.all, 'list'],
  list: (filters) => [...orderKeys.lists(), { filters }],
  details: () => [...orderKeys.all, 'detail'],
  detail: (id) => [...orderKeys.details(), id],
  totalCount: () => [...orderKeys.all, 'totalCount'],
  statusCounts: () => [...orderKeys.all, 'statusCounts'],
};

// Fetch orders list
export const useOrders = (filters = {}) => {
  const { hasSettings } = useWooCommerceSettings();
  
  return useQuery({
    queryKey: orderKeys.list(filters),
    queryFn: () => ordersAPI.list({
      page: filters.page || 1,
      per_page: filters.per_page || PER_PAGE,
      orderby: 'date',
      order: 'desc',
      _fields: filters.fields, // Pass fields if present
      ...filters,
    }),
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch all orders (for client-side filtering)
export const useAllOrders = () => {
  const { hasSettings } = useWooCommerceSettings();
  
  return useQuery({
    queryKey: [...orderKeys.all, 'all'],
    queryFn: async () => {
      let allOrders = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await ordersAPI.list({
          page,
          per_page: 100,
          orderby: 'date',
          order: 'desc',
        });
        allOrders = [...allOrders, ...response.data];
        hasMore = page < response.totalPages;
        page++;
      }

      return allOrders;
    },
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch single order
export const useOrder = (id) => {
  const { hasSettings } = useWooCommerceSettings();
  
  return useQuery({
    queryKey: orderKeys.detail(id),
    queryFn: () => ordersAPI.get(id),
    enabled: !!id && hasSettings, // Only fetch if ID exists and settings are configured
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch total orders count
export const useOrdersTotalCount = () => {
  const { hasSettings } = useWooCommerceSettings();
  
  return useQuery({
    queryKey: orderKeys.totalCount(),
    queryFn: () => ordersAPI.getTotalCount(),
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch orders by status counts
export const useOrderStatusCounts = () => {
  const { hasSettings } = useWooCommerceSettings();
  
  return useQuery({
    queryKey: orderKeys.statusCounts(),
    queryFn: async () => {
      const statuses = ['pending', 'processing', 'on-hold', 'completed', 'cancelled', 'refunded'];
      const counts = {};

      const totalResponse = await ordersAPI.getTotalCount();
      counts.all = totalResponse;

      await Promise.all(
        statuses.map(async (status) => {
          try {
            const response = await ordersAPI.list({
              status,
              per_page: 1,
            });
            counts[status] = response.total || 0;
          } catch (err) {
            counts[status] = 0;
          }
        })
      );

      return counts;
    },
    enabled: hasSettings, // Only fetch if settings are configured
    staleTime: 15 * 60 * 1000,
  });
};

// Update order mutation
export const useUpdateOrder = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => ordersAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: orderKeys.all });
      queryClient.invalidateQueries({ queryKey: orderKeys.detail(variables.id) });
      queryClient.invalidateQueries({ queryKey: orderKeys.statusCounts() });
    },
  });
};

