import { memo, useCallback } from 'react';
import ProductCardImage from './ProductCard/ProductCardImage';
import ProductCardInfo from './ProductCard/ProductCardInfo';
import ProductCardPrice from './ProductCard/ProductCardPrice';
import ProductCardActions from './ProductCard/ProductCardActions';

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
  const handleCardClick = useCallback(() => {
    if (onView) onView(product);
  }, [onView, product]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit && onEdit(product);
  }, [onEdit, product]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete && onDelete(product);
  }, [onDelete, product]);

  return (
    <div
      className="bg-white rounded-lg shadow-sm border border-gray-200 hover:shadow-md transition-shadow overflow-hidden flex flex-col cursor-pointer"
      onClick={handleCardClick}
    >
      {/* Product Image Section */}
      <ProductCardImage
        imageUrl={imageUrl}
        galleryImages={galleryImages}
        productName={productName}
      />

      {/* Product Info */}
      <div className="p-4 flex flex-col flex-1">
        <ProductCardInfo
          productName={productName}
          stockStatus={stockStatus}
          stockStatusLabel={stockStatusLabel}
          sku={sku}
          stockQuantity={stockQuantity}
          stockLabel={stockLabel}
        />

        <ProductCardPrice
          salePrice={salePrice}
          regularPrice={regularPrice}
          displayPrice={displayPrice}
          discountPercentage={discountPercentage}
          offLabel={offLabel}
        />

        <ProductCardActions
          onEdit={handleEdit}
          onDelete={handleDelete}
          editLabel={editLabel}
          deleteLabel={deleteLabel}
        />
      </div>
    </div>
  );
});

ProductCard.displayName = 'ProductCard';

export default ProductCard;

