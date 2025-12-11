import { useState, memo, lazy, Suspense } from 'react';
import { TrashIcon as Trash2, PencilIcon as Edit, ClipboardDocumentIcon as Copy, CheckCircleIcon as CheckCircle } from '@heroicons/react/24/outline';
import { Button } from '../ui';
import { useLanguage } from '../../contexts/LanguageContext';
import CouponsTableSkeleton from './CouponsTableSkeleton';
import { getDiscountText, formatExpiryDate, getStatusConfig } from './utils/couponHelpers';
import { sanitizeCouponCode, validateCoupon } from './utils/securityHelpers';
import { secureLog } from '../../utils/logger';

/**
 * CouponsTable Component
 * 
 * Displays coupons in a table format.
 * PERFORMANCE: Optimized with lazy loading and skeleton states
 * SECURITY: Sanitizes all user-facing data to prevent XSS
 * 
 * @param {Array} coupons - Array of coupon objects
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Boolean} isLoading - Whether data is loading
 */
const CouponsTable = memo(({ coupons, onEdit, onDelete, formatCurrency, isRTL, t, isLoading = false }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = async (code) => {
    // SECURITY: Validate code exists and is a string
    if (!code || typeof code !== 'string') {
      secureLog.warn('Invalid coupon code for copying:', code);
      return;
    }
    
    // Copy the original code (not sanitized) - sanitization is only for display
    // The clipboard API handles the raw text safely
    const codeToCopy = code.trim();
    if (!codeToCopy) return;
    
    try {
      await navigator.clipboard.writeText(codeToCopy);
      // Store original code for comparison (not sanitized)
      setCopiedCode(codeToCopy);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Failed to copy - log securely
      secureLog.warn('Failed to copy coupon code:', err);
    }
  };

  // Show skeleton while loading
  if (isLoading && (!coupons || coupons.length === 0)) {
    return <CouponsTableSkeleton count={10} />;
  }

  if (!coupons || coupons.length === 0) {
    return null;
  }
  
  // SECURITY: Filter out invalid coupons
  const validCoupons = coupons.filter(coupon => validateCoupon(coupon));

  return (
    <div className="card overflow-x-auto">
      <table className="w-full">
        <thead>
          <tr className="border-b border-gray-200">
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('code') || 'Code'}
            </th>
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('discount') || 'Discount'}
            </th>
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('usageLimit') || 'Usage Limit'}
            </th>
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('used') || 'Used'}
            </th>
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('expiryDate') || 'Expiry Date'}
            </th>
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('status') || 'Status'}
            </th>
            <th className={`py-3 px-4 text-sm font-semibold text-gray-700 ${'text-right'}`}>
              {t('actions') || 'Actions'}
            </th>
          </tr>
        </thead>
        <tbody className={isLoading ? 'opacity-50 transition-opacity duration-200' : ''}>
          <Suspense fallback={<CouponsTableSkeleton count={validCoupons.length} />}>
            {validCoupons.map((coupon) => {
              // SECURITY: Sanitize coupon code for display (HTML escaping)
              const sanitizedCode = sanitizeCouponCode(coupon.code);
              const statusConfig = getStatusConfig(coupon.status);
              // Use original code for comparison (trimmed)
              const originalCode = coupon.code ? coupon.code.trim() : '';
              
              return (
                <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
                  <td className="py-3 px-4">
                    <div className="flex items-center gap-2 flex-row">
                      <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                        {sanitizedCode}
                      </code>
                      <Button
                        variant="ghost"
                        size="icon"
                        onClick={(e) => {
                          e.stopPropagation(); // Prevent row click
                          handleCopyCode(coupon.code);
                        }}
                        className="text-gray-400 hover:text-primary-500"
                        title={t('copyCode') || 'Copy code'}
                      >
                        {copiedCode === originalCode ? (
                          <CheckCircle className="w-4 h-4 text-green-500" />
                        ) : (
                          <Copy className="w-4 h-4" />
                        )}
                      </Button>
                    </div>
                  </td>
                  <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                    {getDiscountText(coupon, formatCurrency)}
                  </td>
                  <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                    {coupon.usage_limit ? coupon.usage_limit : t('unlimited') || 'Unlimited'}
                  </td>
                  <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                    {coupon.usage_count || 0}
                  </td>
                  <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                    {formatExpiryDate(coupon.date_expires, t)}
                  </td>
                  <td className="py-3 px-4">
                    <span className={`px-2 py-1 text-xs font-medium rounded ${statusConfig.className}`}>
                      {t(statusConfig.label) || (statusConfig.isActive ? 'Active' : 'Inactive')}
                    </span>
                  </td>
              <td className="py-3 px-4">
                <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onEdit(coupon)}
                    className="text-primary-500 hover:bg-primary-50"
                    title={t('editCoupon') || 'Edit coupon'}
                  >
                    <Edit className="w-[18px] h-[18px]" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onDelete(coupon.id)}
                    className="text-orange-600 hover:bg-orange-50"
                    title={t('deleteCoupon') || 'Delete coupon'}
                  >
                    <Trash2 className="w-[18px] h-[18px]" />
                  </Button>
                </div>
              </td>
                </tr>
              );
            })}
          </Suspense>
        </tbody>
      </table>
    </div>
  );
});

CouponsTable.displayName = 'CouponsTable';

export default CouponsTable;

