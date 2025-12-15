import { memo, useCallback } from 'react';
import ProductCardImage from './ProductCardImage';
import ProductCardInfo from './ProductCardInfo';
import ProductCardActions from './ProductCardActions';

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
  // Optimize callbacks to only recreate when product ID changes, not entire object
  const productId = product.id;

  const handleCardClick = useCallback(() => {
    if (onView) onView(product);
  }, [onView, productId, product]);

  const handleEdit = useCallback((e) => {
    e.stopPropagation();
    onEdit && onEdit(product);
  }, [onEdit, productId, product]);

  const handleDelete = useCallback((e) => {
    e.stopPropagation();
    onDelete && onDelete(product);
  }, [onDelete, productId, product]);

  return (
    <div
      style={{
        backgroundColor: '#f9fafb',
        borderRadius: '12px',
        boxShadow: '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)',
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'box-shadow 0.2s ease',
        height: '100%',
        minWidth: 0,
        width: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)';
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = '0 1px 3px 0 rgba(0, 0, 0, 0.1), 0 1px 2px 0 rgba(0, 0, 0, 0.06)';
      }}
      onClick={handleCardClick}
    >
      {/* Product Image Section */}
      <ProductCardImage
        imageUrl={imageUrl}
        galleryImages={galleryImages}
        productName={productName}
      />

      {/* Product Info */}
      <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', flex: 1, backgroundColor: '#fff', gap: '8px', minWidth: 0, overflow: 'hidden' }}>
        <ProductCardInfo
          productName={productName}
          stockStatus={stockStatus}
          stockStatusLabel={stockStatusLabel}
          sku={sku}
          stockQuantity={stockQuantity}
          stockLabel={stockLabel}
          product={product}
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

