import { UseFormReturn } from 'react-hook-form';
import { ProductFormValues, ProductVariation } from '../types/schemas';
import { useMessage } from '@/contexts/MessageContext';
import { useLanguage } from '@/contexts/LanguageContext';

export const useManualVariation = (
    form: UseFormReturn<ProductFormValues>,
    editingVariationIndex: number | null,
    setEditingVariationIndex: (index: number | null) => void
) => {
    const { t } = useLanguage();
    const messageApi = useMessage();

    const handleManualAdd = (data: ProductVariation) => {
        // Sync attributes: Add any new attributes/options from the modal to the product form state
        const formAttributes = form.getValues('attributes') || [];
        const newFormAttributes = [...formAttributes];
        let attributesChanged = false;

        if (data.attributes && Array.isArray(data.attributes)) {
            data.attributes.forEach((newAttr: any) => {
                const existingAttrIndex = newFormAttributes.findIndex((a: any) => a.name === newAttr.name);

                if (existingAttrIndex > -1) {
                    // Attribute exists, check if option needs to be added
                    const existingOptions = newFormAttributes[existingAttrIndex].options || [];
                    if (!existingOptions.includes(newAttr.option)) {
                        newFormAttributes[existingAttrIndex] = {
                            ...newFormAttributes[existingAttrIndex],
                            options: [...existingOptions, newAttr.option]
                        };
                        attributesChanged = true;
                    }
                } else {
                    // Attribute does not exist, add it
                    newFormAttributes.push({
                        id: newAttr.id || Date.now(),
                        name: newAttr.name,
                        options: [newAttr.option],
                        visible: true,
                        variation: true
                    });
                    attributesChanged = true;
                }
            });
        }

        if (attributesChanged) {
            form.setValue('attributes', newFormAttributes, { shouldDirty: true });
        }

        const existingVariations = form.getValues('variations') || [];

        const newVariation = {
            id: editingVariationIndex !== null && existingVariations[editingVariationIndex] ? existingVariations[editingVariationIndex].id : 0,
            sku: data.sku || '',
            regular_price: data.regular_price,
            sale_price: data.sale_price,
            stock_quantity: data.stock_quantity || 0,
            stock_status: data.stock_status,
            manage_stock: data.manage_stock,
            attributes: data.attributes
        };

        if (editingVariationIndex !== null) {
            const updatedVariations = [...existingVariations];
            updatedVariations[editingVariationIndex] = {
                ...updatedVariations[editingVariationIndex],
                ...newVariation
            };
            form.setValue('variations', updatedVariations, { shouldDirty: true });
            messageApi.success(t('variationUpdated') || 'Variation updated');
        } else {
            form.setValue('variations', [...existingVariations, newVariation], { shouldDirty: true });
            messageApi.success(t('variationAdded') || 'Variation added manually');
        }

        setEditingVariationIndex(null);
    };

    return { handleManualAdd };
};
