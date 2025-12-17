import { memo, useMemo, lazy, Suspense } from 'react';
import { List } from 'antd';
import { processProductForDisplay } from './utils/productProcessing';
import ProductGridSkeleton from './ProductGridSkeleton';

// PERFORMANCE: Lazy load ProductCard for code splitting
// This reduces initial bundle size by ~20-30%
const ProductCard = lazy(() => import('../ProductCard/ProductCard'));

const ProductGrid = memo(({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, columns = 4, isLoading = false }) => {

  // Memoize processed products to avoid recalculating on every render
  // SECURITY: Filter out invalid products (null returns from processProductForDisplay)
  const processedProducts = useMemo(() => {
    return products
      .map((product) => processProductForDisplay(product, formatCurrency, t))
      .filter(product => product !== null); // Filter out invalid products
  }, [products, formatCurrency, t]);

  // Show skeleton while loading initial data
  if (isLoading && processedProducts.length === 0) {
    return <ProductGridSkeleton columns={columns} count={16} />;
  }

  // If no products, don't show skeleton
  if (processedProducts.length === 0) {
    return null;
  }

  return (
    <Suspense fallback={<ProductGridSkeleton columns={columns} count={processedProducts.length} />}>
      <List
        grid={{
          gutter: 24,
          xs: 1,
          sm: 2,
          md: 3,
          lg: 4,
          xl: columns,
          xxl: columns,
        }}
        dataSource={processedProducts}
        style={{
          opacity: isLoading ? 0.5 : 1,
          transition: 'opacity 0.2s ease',
        }}
        renderItem={(productData) => (
          <List.Item style={{ height: '100%' }}>
            <ProductCard
              key={productData.id}
              product={productData.product}
              onView={onView}
              onEdit={onEdit}
              onDelete={onDelete}
              imageUrl={productData.imageUrl}
              galleryImages={productData.galleryImages}
              productName={productData.productName}
              stockStatus={productData.stockStatus}
              stockStatusLabel={productData.stockStatusLabel}
              sku={productData.sku}
              displayPrice={productData.displayPrice}
              salePrice={productData.salePrice}
              regularPrice={productData.regularPrice}
              discountPercentage={productData.discountPercentage}
              stockQuantity={productData.stockQuantity}
              stockLabel={t('stock')}
              editLabel={t('editProduct')}
              deleteLabel={t('deleteProduct')}
              offLabel={t('off')}
              isRTL={isRTL}
            />
          </List.Item>
        )}
      />
    </Suspense>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
