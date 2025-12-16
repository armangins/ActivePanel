import { memo, useCallback } from 'react';
import { theme } from 'antd';
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

  const { token } = theme.useToken();

  return (
    <div
      style={{
        backgroundColor: token.colorBgContainer,
        borderRadius: token.borderRadiusLG,
        border: `1px solid ${token.colorBorderSecondary}`,
        boxShadow: token.boxShadowTertiary,
        overflow: 'hidden',
        display: 'flex',
        flexDirection: 'column',
        cursor: 'pointer',
        transition: 'all 0.2s ease',
        height: '100%',
        minWidth: 0,
        width: '100%'
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.boxShadow = token.boxShadow;
        e.currentTarget.style.borderColor = token.colorBorder;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.boxShadow = token.boxShadowTertiary;
        e.currentTarget.style.borderColor = token.colorBorderSecondary;
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
      <div style={{
        padding: token.padding,
        display: 'flex',
        flexDirection: 'column',
        flex: 1,
        backgroundColor: token.colorBgContainer,
        gap: token.marginXS,
        minWidth: 0,
        borderTop: `1px solid ${token.colorBorderSecondary}`,
        overflow: 'hidden'
      }}>
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

