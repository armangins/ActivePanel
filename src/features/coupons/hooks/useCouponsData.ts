import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { couponsService } from '../api/coupons.service';
import { useSettings } from '@/features/settings';
import { notification } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

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
    const { t } = useLanguage();

    return useMutation({
        mutationFn: couponsService.createCoupon,
        onSuccess: () => {
            notification.success({
                message: t('success') || 'Success',
                description: t('couponCreated') || 'Coupon created successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        },
        onError: (error: any) => {
            notification.error({
                message: t('error') || 'Error',
                description: error.message || t('errorCreatingCoupon') || 'Failed to create coupon'
            });
        }
    });
};

export const useUpdateCoupon = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ id, data }: { id: number; data: any }) => couponsService.updateCoupon(id, data),
        onSuccess: (_, variables) => {
            notification.success({
                message: t('success') || 'Success',
                description: t('couponUpdated') || 'Coupon updated successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
            queryClient.invalidateQueries({ queryKey: ['coupons', variables.id] });
        },
        onError: (error: any) => {
            notification.error({
                message: t('error') || 'Error',
                description: error.message || t('errorUpdatingCoupon') || 'Failed to update coupon'
            });
        }
    });
};

export const useDeleteCoupon = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: couponsService.deleteCoupon,
        onSuccess: () => {
            notification.success({
                message: t('success') || 'Success',
                description: t('couponDeleted') || 'Coupon deleted successfully'
            });
            queryClient.invalidateQueries({ queryKey: ['coupons'] });
        },
        onError: (error: any) => {
            notification.error({
                message: t('error') || 'Error',
                description: error.message || t('errorDeletingCoupon') || 'Failed to delete coupon'
            });
        }
    });
};
