/**
 * Converts an image file to WebP format using the browser's Canvas API.
 * 
 * @param file - The source image file to convert
 * @param quality - output quality between 0 and 1 (default: 0.8)
 * @returns A Promise that resolves to the converted WebP File object
 */
export const convertImageToWebP = (file: File, quality: number = 0.8): Promise<File> => {
    return new Promise((resolve, reject) => {
        // Create an image element to load the source file
        const img = new Image();
        img.src = URL.createObjectURL(file);

        img.onload = () => {
            // Create a canvas element
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;

            // Draw image to canvas
            const ctx = canvas.getContext('2d');
            if (!ctx) {
                URL.revokeObjectURL(img.src);
                reject(new Error('Failed to get canvas context'));
                return;
            }
            ctx.drawImage(img, 0, 0);

            // Convert to WebP blob
            canvas.toBlob(
                (blob) => {
                    // Cleanup source URL
                    URL.revokeObjectURL(img.src);

                    if (!blob) {
                        reject(new Error('Failed to convert image to WebP'));
                        return;
                    }

                    // Create a new File object from the blob
                    // Keep the original name but change extension
                    const originalName = file.name.substring(0, file.name.lastIndexOf('.')) || file.name;
                    const convertedFile = new File([blob], `${originalName}.webp`, {
                        type: 'image/webp',
                        lastModified: Date.now(),
                    });

                    resolve(convertedFile);
                },
                'image/webp',
                quality
            );
        };

        img.onerror = () => {
            URL.revokeObjectURL(img.src);
            reject(new Error('Failed to load image for conversion'));
        };
    });
};
