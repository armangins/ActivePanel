import { useCallback } from 'react';
import { ProductFormValues } from '../types/schemas';
import { ProductCreationResult, ImageUploadResult, UploadProgress } from '../types/upload';
import { calculateProgress, uploadImagesInParallel } from '../services/productUploadService';
import { useImageUpload } from './useImageUpload';
import { api } from '@/services/api';

interface UseCreateSimpleProductProps {
    updateProgress: (updates: Partial<UploadProgress>) => void;
}

/**
 * Hook for creating simple products
 * Handles image upload and product creation for simple product type
 */
export const useCreateSimpleProduct = ({ updateProgress }: UseCreateSimpleProductProps) => {
    const { uploadImage } = useImageUpload();

    const createSimpleProduct = useCallback(async (
        data: ProductFormValues
    ): Promise<ProductCreationResult> => {
        try {
            // Phase 1: Upload images
            // Filter for File objects (new uploads) vs already uploaded images (with src property)
            const imageFiles = (data.images || []).filter((img: any): img is File =>
                img instanceof File
            );

            updateProgress({
                stage: 'uploading-images',
                totalImages: imageFiles.length,
                currentStep: `Uploading images (0/${imageFiles.length})`
            });

            const uploadedImages = await uploadImagesInParallel(
                imageFiles,
                uploadImage,
                (uploaded, total) => {
                    const percentage = calculateProgress(uploaded, total, false, 0, 0);
                    updateProgress({
                        imagesUploaded: uploaded,
                        percentage,
                        currentStep: `Uploading images (${uploaded}/${total})`
                    });
                }
            );

            // Get already uploaded images (those with src property)
            const existingImages = (data.images || []).filter((img: any): img is ImageUploadResult =>
                img && typeof img === 'object' && 'src' in img
            );

            // Combine newly uploaded with existing
            const allImages = [...existingImages, ...uploadedImages];

            // Phase 2: Create product
            updateProgress({
                stage: 'creating-product',
                currentStep: 'Creating product...'
            });

            const productData = {
                name: data.name,
                type: 'simple',
                status: 'publish',
                regular_price: data.regular_price,
                sale_price: data.sale_price,
                description: data.description,
                short_description: data.short_description,
                sku: data.sku,
                manage_stock: data.manage_stock,
                ...(data.manage_stock && { stock_quantity: data.stock_quantity }),
                stock_status: data.stock_status,
                categories: data.categories?.map(c => typeof c === 'number' ? { id: c } : { id: Number(c.id || c) }) || [],
                images: allImages.map(img => ({ id: img.id })),
                date_on_sale_from: data.date_on_sale_from,
                date_on_sale_to: data.date_on_sale_to
            };

            console.log('📤 Sending product data:', JSON.stringify(productData, null, 2));

            const response = await api.post('/products', productData);

            updateProgress({
                stage: 'complete',
                percentage: 100,
                currentStep: 'Product created successfully!'
            });

            return {
                success: true,
                productId: response.data.id
            };
        } catch (error: any) {
            console.error('❌ Product creation failed:', error);
            console.error('❌ Error response:', error.response?.data);
            return {
                success: false,
                error: error.response?.data?.message || error.message || 'Failed to create product'
            };
        }
    }, [uploadImage, updateProgress]);

    return { createSimpleProduct };
};
