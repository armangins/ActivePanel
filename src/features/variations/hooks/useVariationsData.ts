import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { variationsService } from '../api/variations.service';
import { VariationFormData } from '../types';
import { message } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';

export const useVariationsData = (productId: number) => {
    return useQuery({
        queryKey: ['variations', productId],
        queryFn: () => variationsService.getVariations(productId),
        enabled: !!productId,
    });
};

export const useCreateVariation = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ productId, data }: { productId: number; data: VariationFormData }) =>
            variationsService.createVariation(productId, data),
        onSuccess: (_, { productId }) => {
            message.success(t('variationCreated') || 'Variation created');
            queryClient.invalidateQueries({ queryKey: ['variations', productId] });
        },
        onError: (error: any) => {
            message.error(error.message || t('errorCreating') || 'Error creating variation');
        }
    });
};

export const useUpdateVariation = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ productId, variationId, data }: { productId: number; variationId: number; data: VariationFormData }) =>
            variationsService.updateVariation(productId, variationId, data),
        onSuccess: (_, { productId }) => {
            message.success(t('variationUpdated') || 'Variation updated');
            queryClient.invalidateQueries({ queryKey: ['variations', productId] });
        },
        onError: (error: any) => {
            message.error(error.message || t('errorUpdating') || 'Error updating variation');
        }
    });
};

export const useDeleteVariation = () => {
    const queryClient = useQueryClient();
    const { t } = useLanguage();

    return useMutation({
        mutationFn: ({ productId, variationId }: { productId: number; variationId: number }) =>
            variationsService.deleteVariation(productId, variationId),
        onSuccess: (_, { productId }) => {
            message.success(t('variationDeleted') || 'Variation deleted');
            queryClient.invalidateQueries({ queryKey: ['variations', productId] });
        },
        onError: (error: any) => {
            message.error(error.message || t('errorDeleting') || 'Error deleting variation');
        }
    });
};
