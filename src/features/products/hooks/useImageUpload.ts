import { useCallback } from 'react';
import { ImageUploadResult } from '../types/upload';
import { retryWithBackoff, validateImageFile } from '../services/productUploadService';
import { api } from '@/services/api';
import { convertImageToWebP } from '@/utils/imageConversion';

/**
 * Hook for uploading product images
 * Handles validation, upload with retry, and error handling
 */
export const useImageUpload = () => {
    /**
     * Upload a single image file
     */
    const uploadImage = useCallback(async (file: File): Promise<ImageUploadResult> => {
        // Validate file
        const validation = validateImageFile(file);
        if (!validation.valid) {
            throw new Error(validation.error);
        }

        // Convert to WebP
        let fileToUpload: File;
        try {
            fileToUpload = await convertImageToWebP(file);
        } catch (error) {
            console.error('WebP conversion failed', error);
            throw new Error('Failed to convert image to WebP');
        }

        // Upload with retry
        return retryWithBackoff(async () => {
            const formData = new FormData();
            formData.append('file', fileToUpload);

            const response = await api.post('/media', formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });

            return {
                id: response.data.id,
                src: response.data.source_url,
                alt: response.data.alt_text || ''
            };
        });
    }, []);

    return { uploadImage };
};
