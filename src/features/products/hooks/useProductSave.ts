import { useLanguage } from '@/contexts/LanguageContext';
import { useMessage } from '@/contexts/MessageContext';
import { useUpdateProduct, useBatchVariations } from '@/features/products/hooks/useProductsData';
import { ProductFormValues } from '@/features/products/types/schemas';
import { Product } from '@/features/products/types';

interface UseProductSaveProps {
    product: Product;
    onClose: () => void;
}

export const useProductSave = ({ product, onClose }: UseProductSaveProps) => {
    const { t } = useLanguage();
    const messageApi = useMessage();
    const updateMutation = useUpdateProduct();
    const batchVariationsMutation = useBatchVariations();

    const handleSave = async (data: ProductFormValues) => {
        try {
            // 1. Separate Parent and Variation Data
            const { variations, attributes, ...parentData } = data;

            // Sanitize parent data
            const sanitizedData = { ...parentData } as any;

            // Handle empty strings - Ensure we send "" and not null/undefined
            // The API schema likely expects string | number, but definitely not null.
            sanitizedData.sale_price = sanitizedData.sale_price || '';
            sanitizedData.regular_price = sanitizedData.regular_price || '';

            // 2. Update Parent Product
            await updateMutation.mutateAsync({ id: product.id, data: sanitizedData });

            // 3. Update Variations (if variable product and variations exist)
            if (product.type === 'variable' && variations && Array.isArray(variations)) {
                console.log('Raw Variations Form Data:', variations);

                const updateData = variations
                    .filter((v: any) => v.id) // Only update existing variations
                    .map((v: any) => ({
                        id: v.id,
                        regular_price: v.regular_price,
                        sale_price: v.sale_price,
                        stock_quantity: v.stock_quantity,
                        manage_stock: v.stock_quantity !== undefined && v.stock_quantity !== null ? true : v.manage_stock,
                        image: v.image instanceof File ? undefined : undefined
                    }));

                console.log('Sending Batch Update Payload:', updateData);

                if (updateData.length > 0) {
                    await batchVariationsMutation.mutateAsync({
                        productId: product.id,
                        data: { update: updateData }
                    });
                }
            }

            messageApi.success(t('productUpdatedSuccessfully') || 'המוצר עודכן בהצלחה');
            onClose();
        } catch (error: any) {
            console.error('Save error detailed:', JSON.stringify(error?.response?.data || error));
            let errorMessage = t('errorSavingProduct') || 'אופס, נראה שהיתה בעיה בשמירת המוצר נסה שנית';

            if (error?.response?.data) {
                const data = error.response.data;
                if (data.message) {
                    errorMessage += `: ${data.message}`;
                }
                if (Array.isArray(data.errors) && data.errors.length > 0) {
                    // Stringify detailed errors to help debugging
                    const details = data.errors.map((e: any) => {
                        if (e.errors) return JSON.stringify(e.errors);
                        return e.message || e.code || JSON.stringify(e);
                    }).join(', ');
                    errorMessage += ` (${details})`;
                } else if (data.error && typeof data.error === 'string') {
                    errorMessage += `: ${data.error}`;
                } else if (data.code) {
                    errorMessage += `: ${data.code}`;
                }
            } else if (error instanceof Error) {
                errorMessage += `: ${error.message}`;
            }

            messageApi.error(errorMessage, 5);
        }
    };

    return {
        handleSave,
        isSaving: updateMutation.isPending || batchVariationsMutation.isPending
    };
};
