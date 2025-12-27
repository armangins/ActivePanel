import { useCallback } from 'react';
import { ProductFormValues } from '../types/schemas';
import { ImageUploadResult, UploadProgress } from '../types/upload';
import { calculateProgress, uploadImagesInParallel } from '../services/productUploadService';
import { useImageUpload } from './useImageUpload';
import { api } from '@/services/api';
import { productsService } from '../api/products.service';
import { useQueryClient } from '@tanstack/react-query';

interface UseUpdateVariableProductProps {
    updateProgress: (updates: Partial<UploadProgress>) => void;
}

/**
 * Hook for updating variable products with variations
 * Handles image upload for parent and variations, parent product update, and batch variation sync (create/update/delete)
 */
export const useUpdateVariableProduct = ({ updateProgress }: UseUpdateVariableProductProps) => {
    const { uploadImage } = useImageUpload();
    const queryClient = useQueryClient();

    const updateVariableProduct = useCallback(async (
        productId: number,
        data: ProductFormValues,
        existingVariations: any[] = []
    ): Promise<{ success: boolean; error?: string }> => {
        try {
            // Phase 1: Upload all images (parent + variations)
            const parentImageFiles = (data.images || []).filter((img: any): img is File =>
                img instanceof File
            );

            // Get variation images that are files
            const variationImageFiles = (data.variations || []).map(v => v.image).filter((img: any): img is File =>
                img instanceof File
            );

            const totalImages = parentImageFiles.length + variationImageFiles.length;

            if (totalImages > 0) {
                updateProgress({
                    stage: 'uploading-images',
                    totalImages,
                    totalVariations: data.variations?.length || 0,
                    currentStep: `Uploading images (0/${totalImages})`
                });
            }

            let uploadedCount = 0;

            // Upload parent images
            const parentImages = await uploadImagesInParallel(
                parentImageFiles,
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

            // Get already uploaded parent images (those with id/src property)
            // Note: existing images might be { id: 123, src: '...' }
            const existingParentImages = (data.images || []).filter((img: any) =>
                img && typeof img === 'object' && !('size' in img) // File object has 'size', existing image doesn't usually (or check !instanceof File)
            );

            // Combine newly uploaded with existing
            const allParentImages = [...existingParentImages, ...parentImages];

            // Upload variation images
            const variationImages: { [index: number]: ImageUploadResult } = {};
            for (let i = 0; i < (data.variations?.length || 0); i++) {
                const variation = data.variations![i];
                if (variation.image instanceof File) {
                    variationImages[i] = await uploadImage(variation.image);
                    uploadedCount++;
                    const percentage = calculateProgress(uploadedCount, totalImages, false, 0, 0);
                    updateProgress({
                        imagesUploaded: uploadedCount,
                        percentage,
                        currentStep: `Uploading images (${uploadedCount}/${totalImages})`
                    });
                } else if (variation.image && typeof variation.image === 'object') {
                    // Already uploaded image
                    variationImages[i] = variation.image as ImageUploadResult;
                }
            }

            // Phase 2: Update parent product
            updateProgress({
                stage: 'creating-product', // Reuse stage name for compatibility usually, or add 'updating-product'
                currentStep: 'Updating parent product...'
            });

            console.log('🔍 DEBUG: Starting Parent Product Update');

            // CLEANUP: Filter out orphan attributes (attributes marked for variation but not used by any active variation)
            const usedAttributeNames = new Set<string>();
            (data.variations || []).forEach(v => {
                v.attributes?.forEach(a => {
                    if (a.name) usedAttributeNames.add(a.name);
                });
            });

            const cleanedAttributes = (data.attributes || []).filter(attr => {
                // Always keep attributes that are NOT for variations (display only)
                if (!attr.variation) return true;

                // For variation attributes, only keep if they are actually used by at least one variation
                // OR if there are no variations yet (edge case: just added attributes but no variations created)
                // But generally, if we seek to clean up, we should remove them if not used.
                // However, user might be in the middle of creating.
                // Upon Save, if there are variations, we enforce strictly.
                if ((data.variations || []).length > 0) {
                    return usedAttributeNames.has(attr.name);
                }

                // If no variations exist, we keep all attributes (user might be setting them up)
                return true;
            });

            console.log('🧹 DEBUG: cleanedAttributes:', JSON.stringify(cleanedAttributes, null, 2));

            const parentData = {
                name: data.name,
                type: 'variable',
                status: data.status,
                description: data.description,
                short_description: data.short_description,
                sku: data.sku,
                manage_stock: data.manage_stock,
                ...(data.manage_stock && { stock_quantity: data.stock_quantity }),
                stock_status: data.stock_status,
                categories: data.categories?.map(c => typeof c === 'number' ? { id: c } : { id: Number(c.id || c) }) || [],
                images: allParentImages.map(img => ({ id: img.id })),
                attributes: cleanedAttributes.map(attr => ({
                    id: attr.id,
                    name: attr.name,
                    options: attr.options,
                    visible: true,
                    variation: true
                })) || [],
                date_on_sale_from: data.date_on_sale_from,
                date_on_sale_to: data.date_on_sale_to
            };

            await productsService.updateProduct(productId, parentData);
            console.log('✅ Parent product updated');

            // Phase 3: Sync variations (Batch)
            updateProgress({
                stage: 'creating-variations',
                currentStep: 'Syncing variations...'
            });

            const currentVariations = data.variations || [];

            // Helper to track used SKUs in this batch to prevent internal duplicates
            // We use a normalized Set (lowercase + trimmed) for checking, but preserve original casing for output if valid
            const usedSkuKeys = new Set<string>();

            if (data.sku) {
                usedSkuKeys.add(data.sku.trim().toLowerCase());
            }

            const sanitizeSku = (sku: string | undefined | null) => {
                if (!sku) return '';
                const normalized = sku.trim().toLowerCase();

                if (normalized === '') return '';
                if (usedSkuKeys.has(normalized)) return ''; // Collision with Parent or previous variation!

                usedSkuKeys.add(normalized);
                return sku; // Return original if safe
            };

            // Split into updates and creates, ensuring image indices match original array
            const updates: any[] = [];
            const creates: any[] = [];

            currentVariations.forEach((variation, index) => {
                const variationImage = variationImages[index];

                // Common payload structure
                const payload = {
                    regular_price: variation.regular_price,
                    sale_price: variation.sale_price,
                    date_on_sale_from: data.date_on_sale_from,
                    date_on_sale_to: data.date_on_sale_to,
                    sku: sanitizeSku(variation.sku),
                    manage_stock: variation.manage_stock,
                    stock_quantity: variation.stock_quantity,
                    stock_status: variation.stock_status,
                    attributes: variation.attributes?.map(attr => ({
                        id: attr.id,
                        name: attr.name, // Parent attribute name
                        option: attr.option // Selected term
                    })) || [],
                    image: variationImage ? { id: variationImage.id } : null // updates image or removes if null
                };

                if (variation.id && variation.id !== 0) {
                    updates.push({ id: variation.id, ...payload });
                } else {
                    creates.push(payload);
                }
            });

            // 3. Identify Deletes (Exist in Original but Missing from Form)
            const formVariationIds = new Set(currentVariations.map(v => v.id).filter(id => id));
            const deletes = existingVariations
                .filter(v => !formVariationIds.has(v.id))
                .map(v => v.id);

            const batchData = {
                create: creates,
                update: updates,
                delete: deletes
            };

            console.log('📤 DEBUG: Batch Sync Payload:', JSON.stringify(batchData, null, 2));

            if (creates.length > 0 || updates.length > 0 || deletes.length > 0) {
                const response = await api.post(`/products/${productId}/variations/batch`, batchData);

                // Inspect response for partial failures
                const responseData = response.data;
                const hasErrors = (
                    (responseData.create || []).some((item: any) => item.error) ||
                    (responseData.update || []).some((item: any) => item.error) ||
                    (responseData.delete || []).some((item: any) => item.error)
                );

                if (hasErrors) {
                    console.error('❌ Batch update contained errors:', responseData);
                    // We throw here to stop the flow, or we could warn. 
                    // Let's throw to be safe and alert the user.
                    const firstError =
                        (responseData.create || []).find((i: any) => i.error)?.error ||
                        (responseData.update || []).find((i: any) => i.error)?.error ||
                        (responseData.delete || []).find((i: any) => i.error)?.error;

                    throw new Error(firstError?.message || 'Some variations failed to update.');
                }

                console.log('✅ Variations synced successfully!');

                // Invalidate query to refresh UI
                // We need to import useQueryClient or accept it as a prop?
                // Better pattern: return the need to invalidate or import it here if context allows.
                // Since this is a hook detailed in 'src/features/products/hooks', we can use useQueryClient.
            } else {
                console.log('ℹ️ No variation changes detected.');
            }

            updateProgress({
                stage: 'complete',
                percentage: 100,
                currentStep: 'Product updated successfully!'
            });

            // Invalidate queries to force refresh
            queryClient.invalidateQueries({ queryKey: ['product', productId] });
            queryClient.invalidateQueries({ queryKey: ['variations', productId] });

            return { success: true };

        } catch (error: any) {
            console.error('❌ Variable product update failed:', error);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to update variable product'
            };
        }
    }, [uploadImage, updateProgress]);

    return { updateVariableProduct };
};
