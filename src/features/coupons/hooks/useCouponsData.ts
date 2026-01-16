import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsService } from '../api/coupons.service';
import { useSettings } from '@/features/settings';
import { useMessage } from '@/contexts/MessageContext';
import { useLanguage } from '@/contexts/LanguageContext';

import { couponsResponseSchema, couponResponseSchema } from '../types/schemas';

export const useCouponsData = (params: any = {}) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery({
        queryKey: ['coupons', params],
        queryFn: async () => {
            const data = await couponsService.getCoupons(params);
            return couponsResponseSchema.parse(data);
        },
        enabled: isConfigured,
        placeholderData: (previousData) => previousData
    });
};

export const useCouponDetail = (id: number | null) => {
    const { settings } = useSettings();
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    return useQuery({
        queryKey: ['coupons', id],
        queryFn: async () => {
            const data = await couponsService.getCoupon(id!);
            return couponResponseSchema.parse(data);
        },
        enabled: isConfigured && !!id
    });
};

export const useCreateCoupon = () => {
    const queryClient = useQueryClient();
    const message = useMessage();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: couponsService.createCoupon,
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            message.success(t('couponCreated') || 'Coupon created successfully');
        },
        onError: () => {
            message.error(t('couponCreateFailed') || 'Failed to create coupon');
        }
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    const message = useMessage();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => couponsService.updateCoupon(id, data),
        onSuccess: (_, variables) => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons', variables.id] });
            message.success(t('couponUpdated') || 'Coupon updated successfully');
        },
        onError: () => {
            message.error(t('couponUpdateFailed') || 'Failed to update coupon');
        }
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    const message = useMessage();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: couponsService.deleteCoupon,
        onMutate: async (id) => {
            await queryClient.cancelQueries({ queryKey: ['coupons'] });
            const previousCoupons = queryClient.getQueriesData({ queryKey: ['coupons'] });

            queryClient.setQueriesData({ queryKey: ['coupons'] }, (old: any) => {
                if (!old) return old;
                if (old.data && Array.isArray(old.data)) {
                    return {
                        ...old,
                        data: old.data.filter((c: any) => c.id !== id),
                        total: old.total ? old.total - 1 : old.total
                    };
                }
                if (Array.isArray(old)) {
                    return old.filter((c: any) => c.id !== id);
                }
                return old;
            });

            return { previousCoupons };
        },
        onError: (_err, _id, context) => {
            if (context?.previousCoupons) {
                context.previousCoupons.forEach(([queryKey, data]) => {
                    queryClient.setQueryData(queryKey, data);
                });
            }
            message.error(t('couponDeleteFailed') || 'Failed to delete coupon');
        },
        onSettled: () => {
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        },
        onSuccess: () => {
            message.success(t('couponDeleted') || 'Coupon deleted successfully');
        }
    });
};
