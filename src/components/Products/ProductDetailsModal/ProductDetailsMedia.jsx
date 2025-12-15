import { useState, useCallback, useMemo } from 'react';
import { InboxOutlined as Package } from '@ant-design/icons';

/**
 * ProductDetailsMedia Component
 * 
 * Displays product media with interactive gallery feature.
 * Supports clicking thumbnails to swap with main image.
 * 
 * @param {Object} product - Product object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const ProductDetailsMedia = ({ product, isRTL, t }) => {
  // Extract all image URLs from product
  const allImages = useMemo(() => {
    if (!product?.images || product.images.length === 0) return [];
    return product.images.map(img => img.src || img.url || img.source_url).filter(Boolean);
  }, [product?.images]);

  // State to track which image is currently displayed as main
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Get current main image
  const currentMainImage = allImages[selectedImageIndex] || null;

  // Get thumbnail images (all images except the currently selected one)
  const thumbnailImages = useMemo(() => {
    return allImages.filter((_, index) => index !== selectedImageIndex);
  }, [allImages, selectedImageIndex]);

  // Handle thumbnail click to swap images
  const handleThumbnailClick = useCallback((thumbnailIndex) => {
    // Find the actual index in allImages array for the clicked thumbnail
    const clickedImageUrl = thumbnailImages[thumbnailIndex];
    const actualIndex = allImages.findIndex(img => img === clickedImageUrl);
    if (actualIndex !== -1) {
      setSelectedImageIndex(actualIndex);
    }
  }, [thumbnailImages, allImages]);

  return (
    <div className="space-y-4">
      <div>
        <h3 className={`text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
          {t('media') || 'Media'}
        </h3>
        
        {/* Main Image */}
        <div className="w-full rounded-lg overflow-hidden border border-gray-200 bg-gray-50 flex items-center justify-center aspect-square mb-2">
          {currentMainImage ? (
            <img
              src={currentMainImage}
              alt={product.name || 'Product image'}
              className="w-full h-full object-cover"
            />
          ) : (
            <Package className="w-16 h-16 text-gray-300" />
          )}
        </div>

        {/* Gallery Thumbnails */}
        {thumbnailImages.length > 0 && (
          <div className="flex gap-2 overflow-x-auto pb-2">
            {thumbnailImages.slice(0, 6).map((thumbnailImage, index) => (
              <div
                key={`${thumbnailImage}-${index}`}
                onClick={() => handleThumbnailClick(index)}
                className="flex-shrink-0 w-16 h-16 rounded border border-gray-200 overflow-hidden cursor-pointer hover:border-primary-500 hover:opacity-90 transition-all"
                title={t('clickToView') || 'Click to view this image'}
              >
                <img
                  src={thumbnailImage}
                  alt={`${product.name || 'Product'} - Gallery ${index + 1}`}
                  className="w-full h-full object-cover"
                  loading="lazy"
                />
              </div>
            ))}
            {thumbnailImages.length > 6 && (
              <div className="flex-shrink-0 w-16 h-16 rounded border border-gray-200 bg-gray-100 flex items-center justify-center">
                <span className="text-xs text-gray-500">+{thumbnailImages.length - 6}</span>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetailsMedia;


