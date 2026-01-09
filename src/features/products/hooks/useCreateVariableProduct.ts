import { useCallback } from 'react';
import { ProductFormValues } from '../types/schemas';
import { ProductCreationResult, ImageUploadResult, UploadProgress } from '../types/upload';
import { calculateProgress, uploadImagesInParallel } from '../services/productUploadService';
import { useImageUpload } from './useImageUpload';
import { api } from '@/services/api';

interface UseCreateVariableProductProps {
    updateProgress: (updates: Partial<UploadProgress>) => void;
}

/**
 * Hook for creating variable products with variations
 * Handles image upload for parent and variations, parent product creation, and batch variation creation
 */
export const useCreateVariableProduct = ({ updateProgress }: UseCreateVariableProductProps) => {
    const { uploadImage } = useImageUpload();

    const createVariableProduct = useCallback(async (
        data: ProductFormValues
    ): Promise<ProductCreationResult> => {
        try {
            // Phase 1: Upload all images (parent + variations)
            const parentImageFiles = (data.images || []).filter((img: any): img is File =>
                img instanceof File
            );
            const variationImageFiles = (data.variations || []).map(v => v.image).filter((img: any): img is File =>
                img instanceof File
            );
            const totalImages = parentImageFiles.length + variationImageFiles.length;

            updateProgress({
                stage: 'uploading-images',
                totalImages,
                totalVariations: data.variations?.length || 0,
                currentStep: `Uploading images (0/${totalImages})`
            });

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

            // Get already uploaded images (those with src property)
            const existingParentImages = (data.images || []).filter((img: any): img is ImageUploadResult =>
                img && typeof img === 'object' && 'src' in img
            );

            // Combine newly uploaded with existing
            const allParentImages = [...existingParentImages, ...parentImages];

            // Upload variation images
            // Upload variation images
            const variationImages: { [index: number]: ImageUploadResult } = {};

            // 1. Identify which variations have new files to upload
            const variationsWithFiles = (data.variations || [])
                .map((v, index) => ({ file: v.image, index }))
                .filter((item): item is { file: File, index: number } => item.file instanceof File);

            // 2. Upload them in parallel
            if (variationsWithFiles.length > 0) {
                const filesToUpload = variationsWithFiles.map(v => v.file);

                await uploadImagesInParallel(
                    filesToUpload,
                    uploadImage,
                    (uploadedBatchCount) => {
                        // Update progress: existing parent images + uploaded parent images + already uploaded variation images + THIS batch
                        uploadedCount += 1; // logical increment per file, handled by batch? 
                        // Actually uploadImagesInParallel calls this with 'completed' count relative to ITS list
                        // We need global counter. 
                        // Let's rely on strict calculation:
                        // totalUploaded = (currentParentUploaded) + uploadedBatchCount
                        // But we are in a linear flow here.

                        // Re-calculating global uploaded count is safer
                        const totalUploadedSoFar = parentImages.length + uploadedBatchCount;
                        const percentage = calculateProgress(totalUploadedSoFar, totalImages, false, 0, 0);
                        updateProgress({
                            imagesUploaded: totalUploadedSoFar,
                            percentage,
                            currentStep: `Uploading images (${totalUploadedSoFar}/${totalImages})`
                        });
                    }
                ).then(results => {
                    // 3. Map back to indices
                    results.forEach((result, idx) => {
                        variationImages[variationsWithFiles[idx].index] = result;
                    });
                });
            }

            // 4. Handle existing images
            (data.variations || []).forEach((variation, index) => {
                if (variation.image && typeof variation.image === 'object' && 'src' in variation.image && !(variation.image instanceof File)) {
                    variationImages[index] = variation.image as ImageUploadResult;
                }
            });

            // Phase 2: Create parent product
            updateProgress({
                stage: 'creating-product',
                currentStep: 'Creating parent product...'
            });

            // console.log('🔍 DEBUG: Starting Parent Product Creation');
            // console.log('🔍 DEBUG: Raw Form Attributes:', JSON.stringify(data.attributes, null, 2));

            const parentData = {
                name: data.name,
                type: 'variable',
                status: 'publish',
                description: data.description,
                short_description: data.short_description,
                sku: data.sku,
                manage_stock: data.manage_stock,
                ...(data.manage_stock && { stock_quantity: data.stock_quantity }),
                stock_status: data.stock_status,
                categories: data.categories?.map(c => typeof c === 'number' ? { id: c } : { id: Number(c.id || c) }) || [],
                images: allParentImages.map(img => ({ id: img.id })),
                attributes: data.attributes?.map(attr => ({
                    id: attr.id,
                    name: attr.name,
                    options: attr.options,
                    visible: true,
                    variation: true
                })) || [],
                date_on_sale_from: data.date_on_sale_from,
                date_on_sale_to: data.date_on_sale_to
            };

            console.log('📤 DEBUG: Final Parent Product Payload:', JSON.stringify(parentData, null, 2));

            const parentResponse = await api.post('/products', parentData);

            console.log('✅ DEBUG: Parent Product API Response:', JSON.stringify(parentResponse.data, null, 2));

            // Log if attributes were actually saved
            if (parentResponse.data.attributes) {
                console.log('✅ DEBUG: Saved Attributes on Parent:', JSON.stringify(parentResponse.data.attributes, null, 2));
            } else {
                console.warn('⚠️ DEBUG: No attributes returned in parent response!');
            }

            // Handle nested response structure - API might return data.data.id or data.id
            const parentId = parentResponse.data?.data?.id || parentResponse.data?.id;

            if (!parentId) {
                console.error('❌ Could not find ID in response:', parentResponse.data);
                throw new Error('Parent product created but no ID returned');
            }

            console.log('✅ Parent product ID:', parentId);

            const percentage = calculateProgress(totalImages, totalImages, true, 0, data.variations?.length || 0);
            updateProgress({ percentage });

            // Phase 3: Create variations in batch
            updateProgress({
                stage: 'creating-variations',
                currentStep: 'Creating variations...'
            });

            const variationsData = {
                create: data.variations?.map((variation, index) => {
                    const variationImage = variationImages[index];
                    console.log(`📸 DEBUG: Processing Variation ${index}`, variation);

                    return {
                        name: data.name, // Use parent product name as default
                        regular_price: variation.regular_price,
                        sale_price: variation.sale_price,
                        date_on_sale_from: data.date_on_sale_from,
                        date_on_sale_to: data.date_on_sale_to,
                        sku: variation.sku,
                        manage_stock: variation.manage_stock,
                        ...(variation.manage_stock && { stock_quantity: variation.stock_quantity }),
                        stock_status: variation.stock_status,
                        attributes: variation.attributes?.map(attr => ({
                            id: attr.id,
                            name: attr.name,
                            option: attr.option
                        })) || [],
                        image: variationImage ? { id: variationImage.id } : undefined
                    };
                }) || []
            };

            console.log('📤 DEBUG: Final Batch Variations Payload:', JSON.stringify(variationsData, null, 2));

            try {
                const variationsResponse = await api.post(`/products/${parentId}/variations/batch`, variationsData);
                // console.log('✅ Variations created successfully!');
                // console.log('✅ Variations response:', JSON.stringify(variationsResponse.data, null, 2));

                // Validate batch response for errors
                // WooCommerce Batch API returns 200 even if items fail
                const createdVariations = variationsResponse.data.create || variationsResponse.data?.data?.create || [];
                const failedVariations = createdVariations.filter((v: any) => v.error || !v.id);

                if (failedVariations.length > 0) {
                    console.error('❌ Some variations failed to create:', failedVariations);
                    const errorMessages = failedVariations.map((v: any) =>
                        v.error?.message ? `${v.error.message} (Code: ${v.error.code})` : 'Unknown variation error'
                    ).join('; ');

                    throw new Error(`Variations failed to create: ${errorMessages}`);
                }
            } catch (variationError: any) {
                console.error('❌ VARIATION CREATION FAILED:', variationError);
                console.error('❌ Variation error response:', variationError.response?.data);
                console.error('❌ Variation error message:', variationError.message);
                console.error('❌ Variation error status:', variationError.response?.status);

                // Don't fail the whole product creation, but log the error
                throw new Error(`Parent product created but variations failed: ${variationError.response?.data?.message || variationError.message}`);
            }

            updateProgress({
                stage: 'complete',
                percentage: 100,
                variationsCreated: data.variations?.length || 0,
                currentStep: 'Product created successfully!'
            });

            return {
                success: true,
                productId: parentId
            };
        } catch (error: any) {
            console.error('❌ Variable product creation failed:', error);
            console.error('❌ Error response:', error.response?.data);
            console.error('❌ Error message:', error.message);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create variable product'
            };
        }
    }, [uploadImage, updateProgress]);

    return { createVariableProduct };
};
