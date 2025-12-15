import { memo, useMemo } from 'react';
import ProductCardSkeleton from './ProductCardSkeleton';

/**
 * ProductGridSkeleton Component
 * 
 * Skeleton loading grid for ProductGrid
 * Shows multiple ProductCardSkeleton components in a grid layout
 */
const ProductGridSkeleton = memo(({ columns = 4, count = 16 }) => {
  // Calculate grid template columns based on number of columns
  const getGridColumns = (cols) => {
    const config = {
      1: 'repeat(1, 1fr)',
      2: 'repeat(2, 1fr)',
      3: 'repeat(3, 1fr)',
      4: 'repeat(4, 1fr)',
      5: 'repeat(5, 1fr)',
      6: 'repeat(6, 1fr)',
    };
    return config[cols] || config[4];
  };

  // Generate unique ID for this grid instance to scope the styles
  const gridId = useMemo(() => `product-grid-skeleton-${Math.random().toString(36).substr(2, 9)}`, []);

  return (
    <>
      <style>{`
        #${gridId} {
          display: grid;
          grid-template-columns: ${getGridColumns(columns)};
          gap: 24px;
          width: 100%;
        }
        
        @media (max-width: 1024px) {
          #${gridId} {
            grid-template-columns: ${columns >= 4 ? 'repeat(3, 1fr)' : getGridColumns(columns)};
          }
        }
        
        @media (max-width: 768px) {
          #${gridId} {
            grid-template-columns: ${columns >= 3 ? 'repeat(2, 1fr)' : 'repeat(2, 1fr)'};
            gap: 16px;
          }
        }
        
        @media (max-width: 480px) {
          #${gridId} {
            grid-template-columns: repeat(1, 1fr);
            gap: 12px;
          }
        }
      `}</style>
      <div id={gridId}>
        {Array.from({ length: count }).map((_, index) => (
          <ProductCardSkeleton key={`skeleton-${index}`} />
        ))}
      </div>
    </>
  );
});

ProductGridSkeleton.displayName = 'ProductGridSkeleton';

export default ProductGridSkeleton;

