// Upload state and progress types
export interface UploadProgress {
    stage: 'uploading-images' | 'creating-product' | 'creating-variations' | 'complete';
    percentage: number; // 0-100
    currentStep: string;
    imagesUploaded: number;
    totalImages: number;
    variationsCreated: number;
    totalVariations: number;
}

export interface UploadState {
    isUploading: boolean;
    progress: UploadProgress;
    error: string | null;
}

export interface ImageUploadResult {
    id: number;
    src: string;
    alt?: string;
}

export interface VariationImageMap {
    [index: number]: ImageUploadResult;
}

// Product creation result
export interface ProductCreationResult {
    success: boolean;
    productId?: number;
    error?: string;
}
