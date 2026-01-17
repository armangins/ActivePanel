import { useCallback } from 'react';
import { mediaAPI } from '@/services/woocommerce';
// @ts-ignore
import { secureLog } from '@/utils/logger';
import { ImageUploadResult } from '../types/upload';

export const useImageUpload = () => {
    const uploadImage = useCallback(async (file: File): Promise<ImageUploadResult> => {
        try {
            const formData = new FormData();
            formData.append('file', file);

            const response = await mediaAPI.upload(formData);

            // Normalize response to match ImageUploadResult
            return {
                id: response.id,
                src: response.source_url || response.url || '',
                name: response.title?.rendered || file.name,
                alt: response.alt_text || ''
            };
        } catch (error) {
            console.error('Upload failed:', error);
            secureLog.error('Image upload failed', error);
            throw error;
        }
    }, []);

    return { uploadImage };
};
