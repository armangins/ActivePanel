import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { customersAPI } from '../services/woocommerce';
import { PAGINATION_DEFAULTS } from '../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.CUSTOMERS_PER_PAGE;

// Query keys
export const customerKeys = {
  all: ['customers'],
  lists: () => [...customerKeys.all, 'list'],
  list: (filters) => [...customerKeys.lists(), { filters }],
  details: () => [...customerKeys.all, 'detail'],
  detail: (id) => [...customerKeys.details(), id],
  totalCount: () => [...customerKeys.all, 'totalCount'],
};

// Fetch customers list
export const useCustomers = (filters = {}) => {
  return useQuery({
    queryKey: customerKeys.list(filters),
    queryFn: () => customersAPI.list({
      page: filters.page || 1,
      per_page: filters.per_page || PER_PAGE,
      _fields: filters._fields || 'id,first_name,last_name,username,email,avatar_url,billing,shipping,date_created,orders_count,total_spent',
      ...filters,
    }),
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch all customers (for client-side filtering)
export const useAllCustomers = () => {
  return useQuery({
    queryKey: [...customerKeys.all, 'all'],
    queryFn: async () => {
      let allCustomers = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await customersAPI.list({
          page,
          per_page: 100,
        });
        allCustomers = [...allCustomers, ...response.data];
        hasMore = page < response.totalPages;
        page++;
      }

      return allCustomers;
    },
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch single customer
export const useCustomer = (id) => {
  return useQuery({
    queryKey: customerKeys.detail(id),
    queryFn: () => customersAPI.get(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch total customers count
export const useCustomersTotalCount = () => {
  return useQuery({
    queryKey: customerKeys.totalCount(),
    queryFn: () => customersAPI.getTotalCount(),
    staleTime: 15 * 60 * 1000,
  });
};

// Update customer mutation
export const useUpdateCustomer = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => customersAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: customerKeys.all });
      queryClient.invalidateQueries({ queryKey: customerKeys.detail(variables.id) });
    },
  });
};

