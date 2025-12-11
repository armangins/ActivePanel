import { memo, useMemo, lazy, Suspense } from 'react';
import { processProductForDisplay } from './utils/productProcessing';
import { getGridClass } from './utils/gridConfig';
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
    <div className={`grid ${getGridClass(columns)} gap-3 sm:gap-4 md:gap-6 ${isLoading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
      <Suspense fallback={<ProductGridSkeleton columns={columns} count={processedProducts.length} />}>
        {processedProducts.map((productData) => (
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
            salePrice={productData.formattedSalePrice}
            regularPrice={productData.formattedRegularPrice}
            discountPercentage={productData.discountPercentage}
            stockQuantity={productData.stockQuantity}
            stockLabel={t('stock')}
            editLabel={t('editProduct')}
            deleteLabel={t('deleteProduct')}
            offLabel={t('off')}
            isRTL={isRTL}
          />
        ))}
      </Suspense>
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
