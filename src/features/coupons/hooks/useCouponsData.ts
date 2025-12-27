import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsService } from '../api/coupons.service';
import { useSettings } from '@/features/settings';

export const useCouponsData = (params: any = {}) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery({
        queryKey: ['coupons', params],
        queryFn: () => couponsService.getCoupons(params),
        enabled: isConfigured,
        placeholderData: (previousData) => previousData
    });
};

export const useCouponDetail = (id: number | null) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery({
        queryKey: ['coupons', id],
        queryFn: () => couponsService.getCoupon(id!),
        enabled: isConfigured && !!id
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: couponsService.createCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        }
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => couponsService.updateCoupon(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons', variables.id] });
        }
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();

    return useMutation({
        mutationFn: couponsService.deleteCoupon,
        onMutate: async (id) => {
            // Cancel any outgoing refetches (so they don't overwrite our optimistic update)
            await queryClient.cancelQueries({ queryKey: ['coupons'] });

            // Snapshot the previous value
            const previousCoupons = queryClient.getQueriesData({ queryKey: ['coupons'] });

            // Optimistically update to the new value
            queryClient.setQueriesData({ queryKey: ['coupons'] }, (old: any) => {
                if (!old) return old;

                // Handle paginated response structure { data: [], total: ... }
                if (old.data && Array.isArray(old.data)) {
                    return {
                        ...old,
                        data: old.data.filter((c: any) => c.id !== id),
                        total: old.total ? old.total - 1 : old.total
                    };
                }

                // Handle plain array response (if used elsewhere)
                if (Array.isArray(old)) {
                    return old.filter((c: any) => c.id !== id);
                }

                return old;
            });

            // Return a context object with the snapshotted value
            return { previousCoupons };
        },
        onError: (_err, _id, context) => {
            // If the mutation fails, use the context returned from onMutate to roll back
            if (context?.previousCoupons) {
                context.previousCoupons.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
        },
        onSettled: () => {
            // Always refetch after error or success:
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        },
    });
};
