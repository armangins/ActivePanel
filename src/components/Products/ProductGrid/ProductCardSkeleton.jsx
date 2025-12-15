import { memo } from 'react';

/**
 * ProductCardSkeleton Component
 * 
 * Skeleton loading placeholder for ProductCard
 * Shows animated placeholders while products are loading
 */
const ProductCardSkeleton = memo(() => {
  const skeletonId = `skeleton-${Math.random().toString(36).substr(2, 9)}`;
  
  return (
    <>
      <style>{`
        @keyframes pulse {
          0%, 100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
        #${skeletonId} * {
          animation: pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite;
        }
      `}</style>
      <div 
        id={skeletonId}
        style={{
          backgroundColor: '#fff',
          borderRadius: '8px',
          boxShadow: '0 1px 2px 0 rgba(0, 0, 0, 0.05)',
          border: '1px solid #e5e7eb',
          overflow: 'hidden',
          display: 'flex',
          flexDirection: 'column',
        }}
      >
        {/* Image Skeleton */}
        <div style={{ 
          width: '100%', 
          aspectRatio: '1 / 1', 
          backgroundColor: '#e5e7eb' 
        }}></div>

        {/* Content Skeleton */}
        <div style={{ 
          padding: '16px', 
          display: 'flex', 
          flexDirection: 'column', 
          flex: 1, 
          gap: '12px' 
        }}>
          {/* Title Skeleton */}
          <div style={{ 
            height: '20px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px', 
            width: '75%' 
          }}></div>
          
          {/* SKU Skeleton */}
          <div style={{ 
            height: '16px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '4px', 
            width: '50%' 
          }}></div>
          
          {/* Price Skeleton */}
          <div style={{ 
            height: '24px', 
            backgroundColor: '#e5e7eb', 
            borderRadius: '4px', 
            width: '33%', 
            marginTop: '8px' 
          }}></div>
          
          {/* Stock Status Skeleton */}
          <div style={{ 
            height: '16px', 
            backgroundColor: '#f3f4f6', 
            borderRadius: '4px', 
            width: '25%' 
          }}></div>
          
          {/* Actions Skeleton */}
          <div style={{ 
            display: 'flex', 
            gap: '8px', 
            marginTop: 'auto', 
            paddingTop: '8px' 
          }}>
            <div style={{ 
              height: '32px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px', 
              flex: 1 
            }}></div>
            <div style={{ 
              height: '32px', 
              backgroundColor: '#e5e7eb', 
              borderRadius: '4px', 
              flex: 1 
            }}></div>
          </div>
        </div>
      </div>
    </>
  );
});

ProductCardSkeleton.displayName = 'ProductCardSkeleton';

export default ProductCardSkeleton;

