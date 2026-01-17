import { useCallback } from 'react';
import { ProductFormValues } from '../types/schemas';
import { ImageUploadResult, UploadProgress } from '../types/upload';
import { calculateProgress, uploadImagesInParallel } from '../services/productUploadService';
import { useImageUpload } from './useImageUpload';
import { api } from '@/services/api';
import { productsService } from '../api/products.service';
import { validatePreFlightVariations } from '../utils/validationUtils';
import { useQueryClient } from '@tanstack/react-query';

interface UseSaveProductLogicProps {
    updateProgress: (updates: Partial<UploadProgress>) => void;
}

/**
 * Unified Hook for Creating and Updating Products (Simple & Variable)
 * Handles image upload, parent product persistence, and atomic variation synchronization.
 */
export const useSaveProductLogic = ({ updateProgress }: UseSaveProductLogicProps) => {
    const { uploadImage } = useImageUpload();
    const queryClient = useQueryClient();

    const saveProduct = useCallback(async (
        data: ProductFormValues,
        existingVariations: any[] = [],
        productId?: number
    ): Promise<{ success: boolean; error?: string; productId?: number }> => {
        try {
            const isNewProduct = !productId;

            // Phase 1: Upload all images (parent + variations)
            const parentImageFiles = (data.images || []).filter((img: any): img is File =>
                img instanceof File
            );

            // Get variation images only if product is variable
            const isVariable = data.type === 'variable';

            const variationImageFiles = isVariable
                ? (data.variations || []).map(v => v.image).filter((img: any): img is File => img instanceof File)
                : [];

            const totalImages = parentImageFiles.length + variationImageFiles.length;

            if (totalImages > 0) {
                updateProgress({
                    stage: 'uploading-images',
                    totalImages,
                    totalVariations: isVariable ? (data.variations?.length || 0) : 0,
                    currentStep: `Uploading images (0/${totalImages})`
                });
            }

            let uploadedCount = 0;

            // Upload parent images
            const parentImages = await uploadImagesInParallel(
                parentImageFiles as unknown as File[],
                uploadImage,
                (uploaded) => {
                    uploadedCount = uploaded;
                    const percentage = calculateProgress(uploadedCount, totalImages, false, 0, 0);
                    updateProgress({
                        imagesUploaded: uploadedCount,
                        percentage,
                        currentStep: `Uploading images (${uploadedCount}/${totalImages})`
                    });
                }
            );

            const existingParentImages = (data.images || []).filter((img: any) =>
                img && typeof img === 'object' && !('size' in img)
            );

            const allParentImages = [...existingParentImages, ...parentImages];

            // Upload variation images (Only if variable)
            const variationImages: { [index: number]: ImageUploadResult } = {};

            if (isVariable) {
                const variationsWithFiles = (data.variations || [])
                    .map((v, index) => ({ file: v.image, index }))
                    .filter((item): item is { file: File, index: number } => item.file instanceof File);

                if (variationsWithFiles.length > 0) {
                    const filesToUpload = variationsWithFiles.map(v => v.file);

                    await uploadImagesInParallel(
                        filesToUpload,
                        uploadImage,
                        (uploadedBatchCount) => {
                            const totalUploadedSoFar = parentImages.length + uploadedBatchCount;
                            const percentage = calculateProgress(totalUploadedSoFar, totalImages, false, 0, 0);
                            updateProgress({
                                imagesUploaded: totalUploadedSoFar,
                                percentage,
                                currentStep: `Uploading images (${totalUploadedSoFar}/${totalImages})`
                            });
                        }
                    ).then(results => {
                        results.forEach((result, idx) => {
                            variationImages[variationsWithFiles[idx].index] = result;
                        });
                    });
                }

                (data.variations || []).forEach((variation, index) => {
                    if (variation.image && typeof variation.image === 'object' && !(variation.image instanceof File)) {
                        variationImages[index] = variation.image as ImageUploadResult;
                    }
                });
            }

            // Phase 2: Save Parent Product (Create or Update)
            updateProgress({
                stage: 'creating-product',
                currentStep: isNewProduct ? 'Creating product...' : 'Updating parent product...'
            });

            // STRICT PRE-FLIGHT VALIDATION (Only for Variable)
            if (isVariable && data.variations && data.variations.length > 0) {
                const validationResult = validatePreFlightVariations(data.variations, data.attributes || []);
                console.log('🛡️ [SaveHook] Validation Result:', validationResult);
                if (!validationResult.isValid) {
                    const errorMessage = `Validation Failed:\n${validationResult.errors.join('\n')}`;
                    console.error('❌ Pre-flight validation failed:', errorMessage);
                    throw new Error(errorMessage);
                }
            }

            // CLEANUP Attributes
            let cleanedAttributes = data.attributes || [];

            if (isVariable) {
                const usedAttributeNames = new Set<string>();
                (data.variations || []).forEach(v => {
                    v.attributes?.forEach(a => {
                        if (a.name) usedAttributeNames.add(a.name);
                    });
                });

                cleanedAttributes = (data.attributes || []).filter(attr => {
                    if (!attr.variation) return true;
                    if ((data.variations || []).length > 0) {
                        return usedAttributeNames.has(attr.name);
                    }
                    return true;
                });
            }

            const parentData = {
                name: data.name,
                type: data.type || 'simple',
                status: data.status,
                description: data.description,
                short_description: data.short_description,
                sku: data.sku,
                manage_stock: data.manage_stock,
                ...(data.manage_stock && { stock_quantity: data.stock_quantity }),
                stock_status: data.stock_status,
                categories: data.categories?.map(c => typeof c === 'number' ? { id: c } : { id: Number(c.id || c) }) || [],
                images: allParentImages.map(img => ({ id: img.id })) as any[],
                attributes: cleanedAttributes.map(attr => ({
                    id: attr.id,
                    name: attr.name,
                    options: attr.options?.map(opt => decodeURIComponent(opt)) || [],
                    visible: true,
                    variation: attr.variation,
                    slug: attr.slug || attr.name,
                    position: attr.position || 0
                })) || [],
                regular_price: data.regular_price,
                sale_price: data.sale_price,
                date_on_sale_from: data.date_on_sale_from,
                date_on_sale_to: data.date_on_sale_to,
                virtual: data.virtual,
                downloadable: data.downloadable
            };

            let savedParentResponse;
            if (isNewProduct) {
                savedParentResponse = await productsService.createProduct(parentData as any);
            } else {
                savedParentResponse = await productsService.updateProduct(productId!, parentData);
            }

            // Unwrapping: The API might return { success: true, data: Product }
            // We need to ensure we are working with the actual Product object
            const savedParent = (savedParentResponse && savedParentResponse.data && savedParentResponse.success)
                ? savedParentResponse.data
                : savedParentResponse;

            const targetProductId = savedParent.id;

            if (!targetProductId) {
                throw new Error('Failed to retrieve product ID from server response.');
            }

            // Phase 3: Sync variations (Batch) - Only if Variable
            const shouldSyncVariations = savedParent.type === 'variable';

            if (shouldSyncVariations) {
                updateProgress({
                    stage: 'creating-variations',
                    currentStep: 'Syncing variations...'
                });

                const currentVariations = data.variations || [];
                const usedSkuKeys = new Set<string>();

                if (data.sku) {
                    usedSkuKeys.add(data.sku.trim().toLowerCase());
                }

                const sanitizeSku = (sku: string | undefined | null) => {
                    if (!sku) return '';
                    const normalized = sku.trim().toLowerCase();
                    if (normalized === '') return '';
                    if (usedSkuKeys.has(normalized)) return '';
                    usedSkuKeys.add(normalized);
                    return sku;
                };

                const updates: any[] = [];
                const creates: any[] = [];

                currentVariations.forEach((variation, index) => {
                    const variationImage = variationImages[index];

                    // Match attributes to real parent attributes (sync logic)
                    const syncedAttributes = variation.attributes?.map(vAttr => {
                        const parentAttr = savedParent.attributes.find((pa: any) =>
                            pa.name === vAttr.name || pa.id === vAttr.id || (pa.slug && pa.slug === (vAttr as any).slug)
                        );
                        return {
                            id: parentAttr ? parentAttr.id : vAttr.id,
                            name: parentAttr ? parentAttr.name : vAttr.name,
                            option: decodeURIComponent(vAttr.option)
                        };
                    }) || [];

                    // console.log(`🔍 [SaveHook] Variation ${index} synced attributes:`, syncedAttributes);

                    const payload = {
                        regular_price: variation.regular_price,
                        sale_price: variation.sale_price,
                        date_on_sale_from: data.date_on_sale_from,
                        date_on_sale_to: data.date_on_sale_to,
                        sku: sanitizeSku(variation.sku),
                        manage_stock: variation.manage_stock,
                        stock_quantity: variation.stock_quantity,
                        stock_status: variation.stock_status,
                        attributes: syncedAttributes,
                        image: variationImage ? { id: variationImage.id } : null
                    };

                    // Only update if it has an ID AND we are not in creation mode (which implies everything is new)
                    if (variation.id && variation.id !== 0 && !isNewProduct) {
                        updates.push({ id: variation.id, ...payload });
                    } else {
                        creates.push(payload);
                    }
                });

                const formVariationIds = new Set(currentVariations.map(v => v.id).filter(id => id));
                const deletes = isNewProduct ? [] : existingVariations
                    .filter(v => !formVariationIds.has(v.id))
                    .map(v => v.id);

                const batchData = {
                    create: creates,
                    update: updates,
                    delete: deletes
                };

                console.log('📤 [SaveHook] Final Batch Sync Payload:', JSON.stringify(batchData, null, 2));

                if (creates.length > 0 || updates.length > 0 || deletes.length > 0) {
                    const response = await api.post(`/products/${targetProductId}/variations/batch`, batchData);
                    const responseData = response.data;

                    const hasErrors = (
                        (responseData.create || []).some((item: any) => item.error) ||
                        (responseData.update || []).some((item: any) => item.error) ||
                        (responseData.delete || []).some((item: any) => item.error)
                    );

                    if (hasErrors) {
                        console.error('❌ Batch update contained errors:', responseData);
                        const firstError =
                            (responseData.create || []).find((i: any) => i.error)?.error ||
                            (responseData.update || []).find((i: any) => i.error)?.error ||
                            (responseData.delete || []).find((i: any) => i.error)?.error;
                        throw new Error(firstError?.message || 'Some variations failed to update.');
                    }
                    console.log('✅ [SaveHook] Variations synced successfully!', responseData);
                }
            }

            updateProgress({
                stage: 'complete',
                percentage: 100,
                currentStep: isNewProduct ? 'Product created successfully!' : 'Product updated successfully!'
            });

            queryClient.invalidateQueries({ queryKey: ['products'] });
            if (!isNewProduct) {
                queryClient.invalidateQueries({ queryKey: ['product', targetProductId] });
                queryClient.invalidateQueries({ queryKey: ['variations', targetProductId] });
            }

            return { success: true, productId: targetProductId };

        } catch (error: any) {
            console.error('❌ Product save failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to save product'
            };
        }
    }, [uploadImage, updateProgress, queryClient]);

    return { saveProduct };
};



