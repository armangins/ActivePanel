import { useState, useCallback } from 'react';
import { useMessage } from '@/contexts/MessageContext';
import { UploadState, UploadProgress, ProductCreationResult } from '../types/upload';
import { ProductFormValues } from '../types/schemas';
import { useCreateSimpleProduct } from './useCreateSimpleProduct';
import { useCreateVariableProduct } from './useCreateVariableProduct';

const initialProgress: UploadProgress = {
    stage: 'uploading-images',
    percentage: 0,
    currentStep: 'Preparing upload...',
    imagesUploaded: 0,
    totalImages: 0,
    variationsCreated: 0,
    totalVariations: 0
};

/**
 * Main hook for creating products (simple or variable)
 * Orchestrates the upload process and manages upload state
 */
export const useCreateProduct = () => {
    const message = useMessage();
    const [uploadState, setUploadState] = useState<UploadState>({
        isUploading: false,
        progress: initialProgress,
        error: null
    });

    /**
     * Update progress state
     */
    const updateProgress = useCallback((updates: Partial<UploadProgress>) => {
        setUploadState(prev => ({
            ...prev,
            progress: { ...prev.progress, ...updates }
        }));
    }, []);

    // Initialize product creation hooks
    const { createSimpleProduct } = useCreateSimpleProduct({ updateProgress });
    const { createVariableProduct } = useCreateVariableProduct({ updateProgress });

    /**
     * Main upload function
     */
    const uploadProduct = useCallback(async (data: ProductFormValues) => {
        setUploadState({
            isUploading: true,
            progress: initialProgress,
            error: null
        });

        try {
            const result: ProductCreationResult = data.type === 'simple'
                ? await createSimpleProduct(data)
                : await createVariableProduct(data);

            if (result.success) {
                setUploadState(prev => ({
                    ...prev,
                    isUploading: false
                }));
                // Don't auto-close or navigate - let user choose via success buttons
            } else {
                throw new Error(result.error);
            }
        } catch (error: any) {
            const errorMessage = error.message || 'Failed to create product';
            setUploadState(prev => ({
                ...prev,
                error: errorMessage,
                isUploading: false
            }));
            // Re-throw error so the component can handle it (show notification, etc.)
            throw error;
        }
    }, [createSimpleProduct, createVariableProduct]);

    /**
     * Cancel upload
     */
    const cancelUpload = useCallback(() => {
        setUploadState({
            isUploading: false,
            progress: initialProgress,
            error: null
        });
        message.info('Upload cancelled');
    }, []);

    return {
        uploadProduct,
        cancelUpload,
        uploadState
    };
};
