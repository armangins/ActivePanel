import { useState } from 'react';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessage } from '@/contexts/MessageContext';
import { ProductFormValues } from '@/features/products/types/schemas';
import { Product } from '@/features/products/types';
import { useSaveProductLogic } from './useSaveProductLogic';
import { useQueryClient } from '@tanstack/react-query';

interface UseProductSaveProps {
    product?: Product | null;
    onClose: () => void;
}

export const useProductSave = ({ product, onClose }: UseProductSaveProps) => {
    const { t } = useLanguage();
    const messageApi = useMessage();

    // Use the consolidated save hook
    const { saveProduct } = useSaveProductLogic({
        updateProgress: (progress) => {
            console.log('Save Progress:', progress);
        }
    });

    const [isSaving, setIsSaving] = useState(false);

    const handleSave = async (data: ProductFormValues) => {
        setIsSaving(true);
        try {
            console.log('📦 Saving product via consolidated flow:', data);

            // Determine if we are creating or updating
            const productId = product?.id;
            const existingVariations = product?.variations || [];

            const result = await saveProduct(
                data,
                existingVariations,
                productId
            );

            if (result.success) {
                const action = productId ? t('updated') : t('created');
                messageApi.success(`${t('product')} ${action} ${t('successfully')}`);

                // If created, we might want to refresh the list or close
                // Refreshing is handled by query invalidation in the hook
                onClose();
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            console.error('Save error:', error);
            messageApi.error(error.message || t('errorSavingProduct'));
        } finally {
            setIsSaving(false);
        }
    };

    return {
        handleSave,
        isSaving
    };
};
