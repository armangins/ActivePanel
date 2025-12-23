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

            // Get already uploaded images (those with src property)
            const existingParentImages = (data.images || []).filter((img: any): img is ImageUploadResult =>
                img && typeof img === 'object' && 'src' in img
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
                } else if (variation.image && typeof variation.image === 'object' && 'src' in variation.image) {
                    // Already uploaded image
                    variationImages[i] = variation.image as ImageUploadResult;
                }
            }

            // Phase 2: Create parent product
            updateProgress({
                stage: 'creating-product',
                currentStep: 'Creating parent product...'
            });

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

            console.log('📤 Creating variable parent product:', JSON.stringify(parentData, null, 2));

            const parentResponse = await api.post('/products', parentData);

            console.log('✅ Parent product response:', JSON.stringify(parentResponse.data, null, 2));

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
                    console.log(`📸 Variation ${index} image:`, variationImage);

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

            console.log('📤 Creating variations for parent ID:', parentId);
            console.log('📤 Variations data:', JSON.stringify(variationsData, null, 2));

            try {
                const variationsResponse = await api.post(`/products/${parentId}/variations/batch`, variationsData);
                console.log('✅ Variations created successfully!');
                console.log('✅ Variations response:', JSON.stringify(variationsResponse.data, null, 2));
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
