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
        const variationsInput = Array.isArray(data) ? data : [data];
        const currentVariations = form.getValues('variations') || [];

        // 1. DUPLICATE PREVENTION & MERGING
        let updatedVariations = [...currentVariations];
        let addedCount = 0;

        if (editingVariationIndex !== null && !Array.isArray(data)) {
            // CASE 1: Editing a single existing variation
            const singleData = data as ProductVariation;
            updatedVariations[editingVariationIndex] = {
                ...updatedVariations[editingVariationIndex],
                sku: singleData.sku || '',
                regular_price: singleData.regular_price,
                sale_price: singleData.sale_price,
                stock_quantity: singleData.stock_quantity || 0,
                stock_status: singleData.stock_status,
                manage_stock: singleData.manage_stock,
                attributes: singleData.attributes,
                image: singleData.image
            };
            messageApi.success(t('variationUpdated') || 'Variation updated');
        } else {
            // CASE 2: Adding NEW variations (Single or Batch)
            // intelligent merge: check if variation exists
            variationsInput.forEach(newVar => {
                if (!newVar.attributes || newVar.attributes.length === 0) return;

                // STRICT VALIDATION: Filter out variations with missing/empty attribute options
                // This prevents "Any" variations from being created accidentally
                const isIncomplete = newVar.attributes.some((a: any) => !a.option || a.option === '');
                if (isIncomplete) return;

                // Generate signature for duplicate check
                const newSignature = newVar.attributes
                    .map((a: any) => `${a.name}:${a.option}`)
                    .sort()
                    .join('|');

                const existsIndex = updatedVariations.findIndex(existing => {
                    const existingSignature = existing.attributes
                        ?.map((a: any) => `${a.name}:${a.option}`)
                        .sort()
                        .join('|');
                    return existingSignature === newSignature;
                });

                if (existsIndex > -1) {
                    // Update existing variation
                    // useful if user regenerates to update prices or stock for existing combos
                    updatedVariations[existsIndex] = {
                        ...updatedVariations[existsIndex],
                        regular_price: newVar.regular_price,
                        sale_price: newVar.sale_price,
                        stock_quantity: newVar.stock_quantity || 0,
                        manage_stock: newVar.manage_stock,
                        image: newVar.image || updatedVariations[existsIndex].image,
                        sku: newVar.sku || updatedVariations[existsIndex].sku
                    };
                } else {
                    // Add new variation
                    updatedVariations.push({
                        id: 0,
                        sku: newVar.sku || '',
                        regular_price: newVar.regular_price,
                        sale_price: newVar.sale_price,
                        stock_quantity: newVar.stock_quantity || 0,
                        stock_status: newVar.stock_status,
                        manage_stock: newVar.manage_stock,
                        attributes: newVar.attributes,
                        image: newVar.image,
                        price: newVar.regular_price || '',
                        weight: '',
                        length: '',
                        width: '',
                        height: ''
                    });
                    addedCount++;
                }
            });

            if (addedCount > 0) {
                messageApi.success(t('variationsGeneratedCount', { count: addedCount }) || `${addedCount} variations generated`);
            } else {
                messageApi.info(t('variationsUpdated') || 'Existing variations updated');
            }
        }

        // 2. ATTRIBUTE SYNC (PRESERVATION)
        // Recalculate which attributes are used in variations
        const usedAttributeNames = new Set<string>();
        updatedVariations.forEach(v => {
            v.attributes?.forEach((attr: any) => {
                const option = attr.option || attr.slug;
                const isAny = typeof option === 'string' && option.toLowerCase() === 'any';
                if (attr.name && option && !isAny) {
                    usedAttributeNames.add(attr.name);
                }
            });
        });

        const currentFormAttributes = form.getValues('attributes') || [];
        // Map existing attributes: Set variation=true if used, otherwise KEEP it but set variation=false
        const newFormAttributes = currentFormAttributes.map((attr: any) => ({
            ...attr,
            variation: usedAttributeNames.has(attr.name)
        }));

        // 3. MERGE NEW ATTRIBUTES from the wizard
        variationsInput.forEach(v => {
            v.attributes?.forEach((newAttr: any) => {
                const existingIdx = newFormAttributes.findIndex((a: any) => a.name === newAttr.name);
                const valueToAdd = newAttr.slug || newAttr.option;

                if (existingIdx > -1) {
                    // Attribute exists, ensure option is present
                    const existingOptions = newFormAttributes[existingIdx].options || [];
                    if (!existingOptions.includes(valueToAdd)) {
                        newFormAttributes[existingIdx].options = [...existingOptions, valueToAdd];
                    }
                    // Mark as used for variation
                    newFormAttributes[existingIdx].variation = true;
                } else {
                    // Completely new attribute - add it
                    newFormAttributes.push({
                        id: newAttr.id || Date.now() + Math.floor(Math.random() * 1000),
                        name: newAttr.name,
                        options: [valueToAdd],
                        visible: true,
                        variation: true,
                        slug: newAttr.slug || `attr-${Date.now()}`,
                        position: 0
                    });
                }
            });
        });

        // Update form state
        form.setValue('attributes', newFormAttributes, { shouldDirty: true });
        form.setValue('variations', updatedVariations, { shouldDirty: true });

        setEditingVariationIndex(null);
    };

    return { handleManualAdd };
};
