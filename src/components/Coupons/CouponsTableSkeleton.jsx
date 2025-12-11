import { memo } from 'react';

/**
 * CouponsTableSkeleton Component
 * 
 * Skeleton loading placeholder for CouponsTable
 * Shows animated placeholders while coupons are loading
 */
const CouponsTableSkeleton = memo(({ count = 10 }) => {
  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-24 animate-pulse"></div>
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-16 animate-pulse"></div>
            </th>
            <th className="py-3 px-4 text-sm font-semibold text-gray-700 text-right">
              <div className="h-4 bg-gray-200 rounded w-20 animate-pulse"></div>
            </th>
          </tr>
        </thead>
        <tbody>
          {Array.from({ length: count }).map((_, index) => (
            <tr key={`skeleton-row-${index}`} className="border-b border-gray-100 animate-pulse">
              {/* Code */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2">
                  <div className="h-6 bg-gray-200 rounded w-24"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
              </td>
              {/* Discount */}
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-16"></div>
              </td>
              {/* Usage Limit */}
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-12"></div>
              </td>
              {/* Used */}
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-8"></div>
              </td>
              {/* Expiry Date */}
              <td className="py-3 px-4">
                <div className="h-4 bg-gray-200 rounded w-20"></div>
              </td>
              {/* Status */}
              <td className="py-3 px-4">
                <div className="h-6 bg-gray-200 rounded w-16"></div>
              </td>
              {/* Actions */}
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 flex-row-reverse">
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                  <div className="h-6 w-6 bg-gray-200 rounded"></div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
});

CouponsTableSkeleton.displayName = 'CouponsTableSkeleton';

export default CouponsTableSkeleton;
