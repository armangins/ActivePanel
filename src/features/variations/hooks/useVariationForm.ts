import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { variationSchema, VariationFormSchema } from '../types/schemas';
import { Variation } from '../types';
import { useCreateVariation, useUpdateVariation } from './useVariationsData';

interface UseVariationFormProps {
    productId: number;
    variation?: Variation | null;
    onSuccess?: () => void;
}

export const useVariationForm = ({ productId, variation, onSuccess }: UseVariationFormProps) => {
    const createMutation = useCreateVariation();
    const updateMutation = useUpdateVariation();

    const form = useForm<VariationFormSchema>({
        resolver: zodResolver(variationSchema) as any,
        defaultValues: {
            sku: '',
            regular_price: '',
            sale_price: '',
            stock_quantity: 0,
            stock_status: 'instock',
            attributes: [],
            image_id: undefined
        }
    });

    useEffect(() => {
        if (variation) {
            form.reset({
                sku: variation.sku || '',
                regular_price: variation.regular_price || '',
                sale_price: variation.sale_price || '',
                stock_quantity: variation.stock_quantity ?? 0,
                stock_status: variation.stock_status || 'instock',
                attributes: variation.attributes || [],
                image_id: variation.image?.id
            });
        }
    }, [variation, form]);

    const onSubmit = async (data: VariationFormSchema) => {
        try {
            if (variation?.id) {
                await updateMutation.mutateAsync({
                    productId,
                    variationId: variation.id,
                    data
                });
            } else {
                await createMutation.mutateAsync({
                    productId,
                    data
                });
            }
            onSuccess?.();
        } catch (error) {
            console.error('Failed to save variation', error);
        }
    };

    return {
        form,
        isLoading: createMutation.isPending || updateMutation.isPending,
        onSubmit: form.handleSubmit(onSubmit),
        isEditMode: !!variation
    };
};
