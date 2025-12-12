import { memo } from 'react';

/**
 * ProductListTableSkeleton Component
 * 
 * Skeleton loading placeholder for ProductListTable
 * Shows animated placeholders while products are loading
 */
const ProductListTableSkeleton = memo(({ count = 16 }) => {
  return (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full table-auto">
          {/* Header Skeleton */}
          <thead className="bg-gray-50">
            <tr>
              <th className="py-3 px-4 w-12 text-center">
                <div className="h-4 w-4 bg-gray-200 rounded animate-pulse mx-auto"></div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
              </th>
              <th className="py-3 px-4 text-right">
                <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
              </th>
              <th className="py-3 px-4 w-16"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-200">
            {Array.from({ length: count }).map((_, index) => (
              <tr key={`skeleton-row-${index}`} className="animate-pulse">
                {/* Checkbox */}
                <td className="py-3 px-4 w-12 text-center">
                  <div className="h-4 w-4 bg-gray-200 rounded mx-auto"></div>
                </td>
                {/* Product */}
                <td className="py-3 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-12 h-12 bg-gray-200 rounded-lg flex-shrink-0"></div>
                    <div className="flex-1 space-y-2">
                      <div className="h-4 bg-gray-200 rounded w-3/4"></div>
                      <div className="h-3 bg-gray-100 rounded w-1/2"></div>
                    </div>
                  </div>
                </td>
                {/* Category */}
                <td className="py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-20"></div>
                </td>
                {/* Price */}
                <td className="py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                {/* Sale Price */}
                <td className="py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-12"></div>
                </td>
                {/* Stock */}
                <td className="py-3 px-4">
                  <div className="h-4 bg-gray-200 rounded w-16"></div>
                </td>
                {/* Actions */}
                <td className="py-3 px-4 w-16">
                  <div className="h-6 w-6 bg-gray-200 rounded mx-auto"></div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

ProductListTableSkeleton.displayName = 'ProductListTableSkeleton';

export default ProductListTableSkeleton;

