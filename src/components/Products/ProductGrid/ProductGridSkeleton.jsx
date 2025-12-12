import { memo } from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';
import { getGridClass } from './utils/gridConfig';

/**
 * ProductGridSkeleton Component
 * 
 * Skeleton loading grid for ProductGrid
 * Shows multiple ProductCardSkeleton components in a grid layout
 */
const ProductGridSkeleton = memo(({ columns = 4, count = 16 }) => {
  return (
    <div className={`grid ${getGridClass(columns)} gap-3 sm:gap-4 md:gap-6`}>
      {Array.from({ length: count }).map((_, index) => (
        <ProductCardSkeleton key={`skeleton-${index}`} />
      ))}
    </div>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export default ProductGridSkeleton;

