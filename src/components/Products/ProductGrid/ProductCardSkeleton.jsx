import { memo } from 'react';

/**
 * ProductCardSkeleton Component
 * 
 * Skeleton loading placeholder for ProductCard
 * Shows animated placeholders while products are loading
 */
const ProductCardSkeleton = memo(() => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden flex flex-col animate-pulse">
      {/* Image Skeleton */}
      <div className="w-full aspect-square bg-gray-200 animate-pulse"></div>

      {/* Content Skeleton */}
      <div className="p-4 flex flex-col flex-1 space-y-3">
        {/* Title Skeleton */}
        <div className="h-5 bg-gray-200 rounded w-3/4"></div>
        
        {/* SKU Skeleton */}
        <div className="h-4 bg-gray-100 rounded w-1/2"></div>
        
        {/* Price Skeleton */}
        <div className="h-6 bg-gray-200 rounded w-1/3 mt-2"></div>
        
        {/* Stock Status Skeleton */}
        <div className="h-4 bg-gray-100 rounded w-1/4"></div>
        
        {/* Actions Skeleton */}
        <div className="flex gap-2 mt-auto pt-2">
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
          <div className="h-8 bg-gray-200 rounded flex-1"></div>
        </div>
      </div>
    </div>
  );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export default ProductCardSkeleton;

