import { ImageUploadResult } from '../types/upload';

/**
 * Calculate overall upload progress based on current state
 * Weight distribution: Images 40%, Product 30%, Variations 30%
 */
export const calculateProgress = (
    imagesUploaded: number,
    totalImages: number,
    productCreated: boolean,
    variationsCreated: number,
    totalVariations: number
): number => {
    let percentage = 0;

    // Images phase (40%)
    if (totalImages > 0) {
        percentage = (imagesUploaded / totalImages) * 40;
    }

    // Product phase (30%)
    if (productCreated) {
        percentage = 40 + 30;
    }

    // Variations phase (30%)
    if (totalVariations > 0 && variationsCreated > 0) {
        percentage = 70 + (variationsCreated / totalVariations) * 30;
    }

    return Math.min(Math.round(percentage), 100);
};

/**
 * Upload images in parallel with concurrency limit
 */
export const uploadImagesInParallel = async (
    files: File[],
    uploadFn: (file: File) => Promise<ImageUploadResult>,
    onProgress?: (uploaded: number, total: number) => void,
    maxConcurrent = 3
): Promise<ImageUploadResult[]> => {
    const results: ImageUploadResult[] = [];
    let completed = 0;

    // Process in batches
    for (let i = 0; i < files.length; i += maxConcurrent) {
        const batch = files.slice(i, i + maxConcurrent);
        const batchResults = await Promise.all(
            batch.map(file => uploadFn(file))
        );

        results.push(...batchResults);
        completed += batch.length;

        if (onProgress) {
            onProgress(completed, files.length);
        }
    }

    return results;
};

/**
 * Retry a function with exponential backoff
 */
export const retryWithBackoff = async <T>(
    fn: () => Promise<T>,
    maxRetries = 3,
    baseDelay = 1000
): Promise<T> => {
    let lastError: Error;

    for (let attempt = 0; attempt < maxRetries; attempt++) {
        try {
            return await fn();
        } catch (error) {
            lastError = error as Error;

            if (attempt < maxRetries - 1) {
                const delay = baseDelay * Math.pow(2, attempt);
                await new Promise(resolve => setTimeout(resolve, delay));
            }
        }
    }

    throw lastError!;
};

/**
 * Sanitize filename for upload
 */
export const sanitizeFilename = (filename: string): string => {
    return filename.replace(/[^a-zA-Z0-9.-]/g, '_');
};

/**
 * Validate image file
 */
export const validateImageFile = (file: File): { valid: boolean; error?: string } => {
    const maxSize = 10 * 1024 * 1024; // 10MB
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp', 'image/gif'];

    if (!allowedTypes.includes(file.type)) {
        return {
            valid: false,
            error: 'Invalid file type. Only JPEG, PNG, WebP, and GIF are allowed.'
        };
    }

    if (file.size > maxSize) {
        return {
            valid: false,
            error: 'File size exceeds 10MB limit.'
        };
    }

    return { valid: true };
};
