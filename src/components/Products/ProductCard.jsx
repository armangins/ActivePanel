import { memo, useCallback, useState } from 'react';
import { TrashIcon as Trash2, PencilIcon as Edit, CubeIcon as Package } from '@heroicons/react/24/outline';
import { OptimizedImage } from '../ui';

const ProductCard = memo(({
  product,
  onView,
  onEdit,
  onDelete,
  // Display props
  imageUrl,
  galleryImages = [], // Array of gallery image URLs
  productName,
  stockStatus,
  stockStatusLabel,
  sku,
  displayPrice,
  salePrice,
  regularPrice,
  discountPercentage,
  stockQuantity,
  stockLabel,
  editLabel,
  deleteLabel,
  offLabel,
  isRTL
}) => {
  // Gallery state - track which image is currently displayed as main (0 = original main, 1+ = gallery index)
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Combine all images: main image + gallery images
  const allImages = imageUrl ? [imageUrl, ...galleryImages] : galleryImages;

  // Get current main image based on selected index
  const currentMainImage = allImages[selectedImageIndex] || imageUrl;

  // Get thumbnail images (all images except the currently selected one)
  const thumbnailImages = allImages.filter((_, index) => index !== selectedImageIndex);

  const handleCardClick = useCallback(() => {
    if (onView) onView(product);
  }, [onView, product]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit && onEdit(product);
  }, [onEdit, product]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete && onDelete(product.id);
  }, [onDelete, product.id]);

  const handleThumbnailClick = useCallback((e, index) => {
    e.stopPropagation(); // Prevent card click
    // Calculate the actual index in allImages array
    // If clicking thumbnail 0, it could be original main (index 0) or first gallery (index 1)
    // We need to find which image was clicked based on the thumbnail array
    const clickedImageUrl = thumbnailImages[index];
    const actualIndex = allImages.findIndex(img => img === clickedImageUrl);
    if (actualIndex !== -1) {
      setSelectedImageIndex(actualIndex);
    }
  }, [thumbnailImages, allImages]);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image Section */}
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

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        {/* Product Name, Stock Status, SKU, and Stock */}
        <div className="mb-3">
          <div className={`flex items-baseline ${'flex-row-reverse'} justify-center gap-2 mb-2`}>
            {stockStatus === 'instock' ? (
              <div className={`flex items-center gap-1.5 flex-shrink-0 ${'flex-row-reverse'}`}>
                <span className="text-xs font-medium text-gray-700">
                  {stockStatusLabel}
                </span>
                <span className="w-2 h-2 rounded-full bg-green-500"></span>
              </div>
            ) : (
              <span className="px-2 py-1 text-xs font-medium rounded flex-shrink-0 bg-orange-100 text-orange-800">
                {stockStatusLabel}
              </span>
            )}
            <h3 className="text-lg font-semibold text-gray-900 flex-1 line-clamp-1 text-right">
              {productName}
            </h3>
          </div>
          <div className="text-right">
            {sku && (
              <p className="text-sm text-gray-500">{sku}</p>
            )}
            {stockQuantity !== null && stockQuantity !== undefined && (
              <p className="text-sm text-gray-500">
                {stockLabel}: {stockQuantity}
              </p>
            )}
          </div>
        </div>

        {/* First Row: Prices and Discount */}
        <div className={`flex items-center ${'flex-row-reverse'} justify-end gap-2 pt-3 border-t border-gray-200 flex-wrap`}>
          {salePrice ? (
            <>
              <p className="text-2xl font-regular text-primary-500">
                {salePrice}
              </p>
              {regularPrice && (
                <p className="text-sm text-gray-400 line-through">
                  {regularPrice}
                </p>
              )}
              {discountPercentage > 0 && (
                <span className="px-2 py-1 text-xs font-bold text-white bg-orange-500 rounded">
                  {discountPercentage}% {offLabel}
                </span>
              )}
            </>
          ) : (
            <p className="text-2xl font-regular text-gray-900">
              {displayPrice}
            </p>
          )}
        </div>

        {/* Second Row: Action Buttons */}
        <div className="flex pt-2 mt-auto w-full justify-start">
          <div className={`flex ${'flex-row-reverse'} gap-2`}>
            <button
              onClick={handleEdit}
              className="w-10 h-10 flex items-center justify-center text-primary-500 hover:bg-primary-50 rounded-lg transition-colors border border-gray-200"
              title={editLabel}
            >
              <Edit className="w-5 h-5" />
            </button>
            <button
              onClick={handleDelete}
              className="w-10 h-10 flex items-center justify-center text-orange-600 hover:bg-orange-50 rounded-lg transition-colors border border-gray-200"
              title={deleteLabel}
            >
              <Trash2 className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

