import { useState, useCallback } from 'react';
import { CubeIcon as Package } from '@heroicons/react/24/outline';
import { OptimizedImage } from '../../ui';

const ProductCardImage = ({
    imageUrl,
    galleryImages = [],
    productName,
}) => {
    // Gallery state - track which image is currently displayed as main (0 = original main, 1+ = gallery index)
    const [selectedImageIndex, setSelectedImageIndex] = useState(0);

    // Combine all images: main image + gallery images
    const allImages = imageUrl ? [imageUrl, ...galleryImages] : galleryImages;

    // Get current main image based on selected index
    const currentMainImage = allImages[selectedImageIndex] || imageUrl;

    // Get thumbnail images (all images except the currently selected one)
    const thumbnailImages = allImages.filter((_, index) => index !== selectedImageIndex);

    const handleThumbnailClick = useCallback((e, index) => {
        e.stopPropagation(); // Prevent card click
        // Calculate the actual index in allImages array
        const clickedImageUrl = thumbnailImages[index];
        const actualIndex = allImages.findIndex(img => img === clickedImageUrl);
        if (actualIndex !== -1) {
            setSelectedImageIndex(actualIndex);
        }
    }, [thumbnailImages, allImages]);

    return (
        <div className="w-full">
            {/* Main Image */}
            <div className="w-full aspect-square relative bg-gray-100">
                {currentMainImage ? (
                    <OptimizedImage
                        src={currentMainImage}
                        alt={productName}
                        className="w-full h-full object-cover"
                    />
                ) : (
                    <div className="w-full h-full flex items-center justify-center">
                        <Package className="w-12 h-12 text-gray-400" />
                    </div>
                )}
            </div>

            {/* Gallery Thumbnails */}
            {thumbnailImages.length > 0 && (
                <div className="px-2 pb-2 pt-1 flex gap-1 overflow-x-auto">
                    {thumbnailImages.slice(0, 4).map((thumbnailImage, index) => {
                        // Check if this thumbnail corresponds to the currently selected main image
                        const isSelected = allImages[selectedImageIndex] === thumbnailImage;

                        return (
                            <div
                                key={`${thumbnailImage}-${index}`}
                                onClick={(e) => handleThumbnailClick(e, index)}
                                className={`flex-shrink-0 w-12 h-12 rounded overflow-hidden cursor-pointer transition-all relative bg-gray-50 ${isSelected
                                    ? 'border-2 border-primary-500 ring-2 ring-primary-200'
                                    : 'border border-gray-200 hover:border-primary-500 hover:opacity-90'
                                    }`}
                                title={`Click to view this image`}
                            >
                                <OptimizedImage
                                    src={thumbnailImage}
                                    alt={`${productName} - Gallery ${index + 1}`}
                                    className="w-full h-full object-cover"
                                />
                            </div>
                        );
                    })}
                    {thumbnailImages.length > 4 && (
                        <div className="flex-shrink-0 w-12 h-12 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                            <span className="text-xs text-gray-500">+{thumbnailImages.length - 4}</span>
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default ProductCardImage;
