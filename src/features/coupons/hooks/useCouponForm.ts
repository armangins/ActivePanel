import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { couponSchema, CouponFormSchema } from '../types/schemas';
import { Coupon } from '../types';
import { useCreateCoupon, useUpdateCoupon } from './useCouponsData';

import { useLanguage } from '@/contexts/LanguageContext';

export const useCouponForm = (coupon?: Coupon | null, onClose?: () => void, messageApi?: any) => {
    const { t } = useLanguage();
    const createMutation = useCreateCoupon();
    const updateMutation = useUpdateCoupon();

    const form = useForm<CouponFormSchema>({
        resolver: zodResolver(couponSchema) as any,
        defaultValues: {
            code: '',
            description: '',
            discount_type: 'percent',
            amount: '0',
            free_shipping: false,
            individual_use: false,
            exclude_sale_items: false,
            usage_limit: null,
            usage_limit_per_user: null,
            product_ids: [],
            excluded_product_ids: [],
            product_categories: [],
            excluded_product_categories: [],
            email_restrictions: []
        }
    });

    // Populate form when editing
    useEffect(() => {
        if (coupon) {
            form.reset({
                code: coupon.code,
                description: coupon.description,
                discount_type: coupon.discount_type,
                amount: coupon.amount,
                date_expires: coupon.date_expires ? coupon.date_expires.split('T')[0] : null,
                free_shipping: coupon.free_shipping,
                individual_use: coupon.individual_use,
                exclude_sale_items: coupon.exclude_sale_items,
                usage_limit: coupon.usage_limit,
                usage_limit_per_user: coupon.usage_limit_per_user,
                product_ids: coupon.product_ids || [],
                excluded_product_ids: coupon.excluded_product_ids || [],
                product_categories: coupon.product_categories || [],
                excluded_product_categories: coupon.excluded_product_categories || [],
                email_restrictions: coupon.email_restrictions || []
            });
        } else {
            form.reset({
                code: '',
                description: '',
                discount_type: 'percent',
                amount: '0',
                free_shipping: false,
                individual_use: false,
                exclude_sale_items: false,
                usage_limit: null,
                usage_limit_per_user: null,
                product_ids: [],
                excluded_product_ids: [],
                product_categories: [],
                excluded_product_categories: [],
                email_restrictions: []
            });
        }
    }, [coupon, form]);

    const onSubmit = async (data: CouponFormSchema) => {
        try {
            if (coupon?.id) {
                await updateMutation.mutateAsync({ id: coupon.id, data });
                messageApi?.success(t('couponUpdated') || 'Coupon updated successfully');
            } else {
                await createMutation.mutateAsync(data);
                messageApi?.success(t('couponCreated') || 'Coupon created successfully');
            }
            onClose?.();
        } catch (error: any) {
            console.error('Failed to save coupon', error);
            messageApi?.error(error.message || t('errorSavingCoupon') || 'Failed to save coupon');
        }
    };

    const generateRandomCode = () => {
        const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let result = '';
        for (let i = 0; i < 8; i++) {
            result += chars.charAt(Math.floor(Math.random() * chars.length));
        }
        form.setValue('code', result);
    };

    return {
        form,
        isLoading: createMutation.isPending || updateMutation.isPending,
        onSubmit: form.handleSubmit(onSubmit),
        isEditMode: !!coupon,
        generateRandomCode
    };
};
