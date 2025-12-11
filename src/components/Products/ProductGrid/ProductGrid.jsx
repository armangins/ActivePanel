import { memo, useMemo } from 'react';
import ProductCard from '../ProductCard/ProductCard';
import { processProductForDisplay } from './utils/productProcessing';

const ProductGrid = memo(({ products, onView, onEdit, onDelete, formatCurrency, isRTL, t, columns = 4, isLoading = false }) => {
  // Map columns to Tailwind grid classes
  const gridColsClass = {
    1: 'grid-cols-1',
    2: 'grid-cols-2 md:grid-cols-2',
    3: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3',
    4: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-4',
    5: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5',
    6: 'grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6',
  };

  // Memoize processed products to avoid recalculating on every render
  const processedProducts = useMemo(() => {
    return products.map((product) => processProductForDisplay(product, formatCurrency, t));
  }, [products, formatCurrency, t]);

  return (
    <div className={`grid ${gridColsClass[columns] || gridColsClass[4]} gap-3 sm:gap-4 md:gap-6 ${isLoading ? 'opacity-50 transition-opacity duration-200' : ''}`}>
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
    </div>
  );
});

ProductGrid.displayName = 'ProductGrid';

export default ProductGrid;
