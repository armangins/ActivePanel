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

    const handleManualAdd = (data: ProductVariation | ProductVariation[]) => {
        // Handle both single object and array
        const variationsList = Array.isArray(data) ? data : [data];

        // Sync attributes: Add any new attributes/options from the modal to the product form state
        // We accumulate changes across all variations in the list
        const formAttributes = form.getValues('attributes') || [];
        const newFormAttributes = [...formAttributes];
        let attributesChanged = false;

        variationsList.forEach(variation => {
            if (variation.attributes && Array.isArray(variation.attributes)) {
                variation.attributes.forEach((newAttr: any) => {
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
                        // Attribute does not exist, check if we already added it in this batch (from previous variation in loop)
                        const newlyAddedIndex = newFormAttributes.findIndex((a: any) => a.name === newAttr.name);
                        if (newlyAddedIndex > -1) {
                            // Already added in this batch, just append option logic
                            const existingOptions = newFormAttributes[newlyAddedIndex].options || [];
                            if (!existingOptions.includes(newAttr.option)) {
                                newFormAttributes[newlyAddedIndex].options.push(newAttr.option);
                                attributesChanged = true;
                            }
                        } else {
                            // Attribute completely new to the form
                            newFormAttributes.push({
                                id: newAttr.id || Date.now() + Math.random(),
                                name: newAttr.name,
                                options: [newAttr.option],
                                visible: true,
                                variation: true
                            });
                            attributesChanged = true;
                        }
                    }
                });
            }
        });

        if (attributesChanged) {
            form.setValue('attributes', newFormAttributes, { shouldDirty: true });
        }

        const existingVariations = form.getValues('variations') || [];

        // CASE 1: Editing a SINGLE variation
        if (editingVariationIndex !== null && !Array.isArray(data)) {
            const singleData = data as ProductVariation;
            const newVariation = {
                id: existingVariations[editingVariationIndex] ? existingVariations[editingVariationIndex].id : 0,
                sku: singleData.sku || '',
                regular_price: singleData.regular_price,
                sale_price: singleData.sale_price,
                stock_quantity: singleData.stock_quantity || 0,
                stock_status: singleData.stock_status,
                manage_stock: singleData.manage_stock,
                attributes: singleData.attributes,
                image: singleData.image
            };

            const updatedVariations = [...existingVariations];
            updatedVariations[editingVariationIndex] = {
                ...updatedVariations[editingVariationIndex],
                ...newVariation
            };
            form.setValue('variations', updatedVariations, { shouldDirty: true });
            messageApi.success(t('variationUpdated') || 'Variation updated');
        }
        // CASE 2: Adding NEW variations (Single or Batch)
        else {
            const newVariations = variationsList.map((v) => ({
                id: 0, // New variation ID placeholder
                sku: v.sku || '', // If bulk generating, sku might be empty or pattern-based
                regular_price: v.regular_price,
                sale_price: v.sale_price,
                stock_quantity: v.stock_quantity || 0,
                stock_status: v.stock_status,
                manage_stock: v.manage_stock,
                attributes: v.attributes,
                image: v.image
            }));

            form.setValue('variations', [...existingVariations, ...newVariations], { shouldDirty: true });

            if (newVariations.length > 1) {
                messageApi.success(t('variationsGeneratedCount', { count: newVariations.length }) || `${newVariations.length} variations generated`);
            } else {
                messageApi.success(t('variationAdded') || 'Variation added manually');
            }
        }

        setEditingVariationIndex(null);
    };

    return { handleManualAdd };
};
