import { useState } from 'react';
import { Edit, Trash2, Copy, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CouponsTable Component
 * 
 * Displays coupons in a table format.
 * 
 * @param {Array} coupons - Array of coupon objects
 * @param {Function} onEdit - Callback when edit is clicked
 * @param {Function} onDelete - Callback when delete is clicked
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CouponsTable = ({ coupons, onEdit, onDelete, formatCurrency, isRTL, t }) => {
  const [copiedCode, setCopiedCode] = useState(null);

  const handleCopyCode = async (code) => {
    try {
      await navigator.clipboard.writeText(code);
      setCopiedCode(code);
      setTimeout(() => setCopiedCode(null), 2000);
    } catch (err) {
      // Failed to copy
    }
  };

  const getDiscountText = (coupon) => {
    if (coupon.discount_type === 'percent') {
      return `${coupon.amount}%`;
    } else if (coupon.discount_type === 'fixed_cart' || coupon.discount_type === 'fixed_product') {
      return formatCurrency(parseFloat(coupon.amount || 0));
    }
    return coupon.amount || '0';
  };

  const getStatusBadge = (status) => {
    const isActive = status === 'publish';
    return (
      <span className={`px-2 py-1 text-xs font-medium rounded ${
        isActive 
          ? 'bg-green-100 text-green-800' 
          : 'bg-gray-100 text-gray-800'
      }`}>
        {isActive ? t('active') || 'Active' : t('inactive') || 'Inactive'}
      </span>
    );
  };

  if (!coupons || coupons.length === 0) {
    return null;
  }

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
        <tbody>
          {coupons.map((coupon) => (
            <tr key={coupon.id} className="border-b border-gray-100 hover:bg-gray-50 transition-colors">
              <td className="py-3 px-4">
                <div className="flex items-center gap-2 flex-row">
                  <code className="text-sm font-mono bg-gray-100 px-2 py-1 rounded">
                    {coupon.code}
                  </code>
                  <button
                    onClick={() => handleCopyCode(coupon.code)}
                    className="text-gray-400 hover:text-primary-500 transition-colors"
                    title={t('copyCode') || 'Copy code'}
                  >
                    {copiedCode === coupon.code ? (
                      <CheckCircle size={16} className="text-green-500" />
                    ) : (
                      <Copy size={16} />
                    )}
                  </button>
                </div>
              </td>
              <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                {getDiscountText(coupon)}
              </td>
              <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                {coupon.usage_limit ? coupon.usage_limit : t('unlimited') || 'Unlimited'}
              </td>
              <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                {coupon.usage_count || 0}
              </td>
              <td className={`py-3 px-4 text-sm ${'text-right'}`}>
                {coupon.date_expires ? new Date(coupon.date_expires).toLocaleDateString() : t('noExpiry') || 'No expiry'}
              </td>
              <td className="py-3 px-4">
                {getStatusBadge(coupon.status)}
              </td>
              <td className="py-3 px-4">
                <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                  <button
                    onClick={() => onEdit(coupon)}
                    className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
                    title={t('editCoupon') || 'Edit coupon'}
                  >
                    <Edit size={18} />
                  </button>
                  <button
                    onClick={() => onDelete(coupon.id)}
                    className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                    title={t('deleteCoupon') || 'Delete coupon'}
                  >
                    <Trash2 size={18} />
                  </button>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default CouponsTable;

