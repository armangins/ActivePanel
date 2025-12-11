import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsAPI } from '../services/woocommerce';
import { PAGINATION_DEFAULTS } from '../shared/constants';

const PER_PAGE = PAGINATION_DEFAULTS.COUPONS_PER_PAGE;

// Query keys
export const couponKeys = {
  all: ['coupons'],
  lists: () => [...couponKeys.all, 'list'],
  list: (filters) => [...couponKeys.lists(), { filters }],
  details: () => [...couponKeys.all, 'detail'],
  detail: (id) => [...couponKeys.details(), id],
  totalCount: () => [...couponKeys.all, 'totalCount'],
};

// Fetch coupons list
export const useCoupons = (filters = {}) => {
  return useQuery({
    queryKey: couponKeys.list(filters),
    queryFn: () => couponsAPI.list({
      page: filters.page || 1,
      per_page: filters.per_page || PER_PAGE,
      ...filters,
    }),
    staleTime: 15 * 60 * 1000, // 15 minutes
    // PERFORMANCE: Use placeholderData for instant display from cache
    placeholderData: (previousData) => previousData,
    // PERFORMANCE: Keep previous data while fetching new data
    keepPreviousData: true,
  });
};

// Fetch all coupons (for client-side filtering)
export const useAllCoupons = () => {
  return useQuery({
    queryKey: [...couponKeys.all, 'all'],
    queryFn: async () => {
      let allCoupons = [];
      let page = 1;
      let hasMore = true;

      while (hasMore) {
        const response = await couponsAPI.list({
          page,
          per_page: 100,
        });
        allCoupons = [...allCoupons, ...response.data];
        hasMore = page < response.totalPages;
        page++;
      }

      return allCoupons;
    },
    staleTime: 15 * 60 * 1000,
  });
};

// Fetch single coupon
export const useCoupon = (id) => {
  return useQuery({
    queryKey: couponKeys.detail(id),
    queryFn: () => couponsAPI.get(id),
    enabled: !!id,
    staleTime: 15 * 60 * 1000,
  });
};

// Create coupon mutation
export const useCreateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (couponData) => couponsAPI.create(couponData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
};

// Update coupon mutation
export const useUpdateCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, data }) => couponsAPI.update(id, data),
    onSuccess: (data, variables) => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
      queryClient.invalidateQueries({ queryKey: couponKeys.detail(variables.id) });
    },
  });
};

// Delete coupon mutation
export const useDeleteCoupon = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id) => couponsAPI.delete(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: couponKeys.all });
    },
  });
};

