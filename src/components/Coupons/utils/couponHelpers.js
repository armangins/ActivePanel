/**
 * Coupon Helpers
 * 
 * Shared utility functions for coupon processing
 * Prevents code duplication and provides consistent formatting
 */

/**
 * Format discount text based on discount type
 * @param {Object} coupon - Coupon object
 * @param {Function} formatCurrency - Currency formatting function
 * @returns {string} Formatted discount text
 */
export const getDiscountText = (coupon, formatCurrency) => {
  if (!coupon) return '0';
  
  if (coupon.discount_type === 'percent') {
    return `${coupon.amount || 0}%`;
  } else if (coupon.discount_type === 'fixed_cart' || coupon.discount_type === 'fixed_product') {
    return formatCurrency(parseFloat(coupon.amount || 0));
  }
  return String(coupon.amount || '0');
};

/**
 * Format expiry date for display
 * @param {string|null} dateExpires - Expiry date string
 * @param {Function} t - Translation function
 * @returns {string} Formatted expiry date or "No expiry"
 */
export const formatExpiryDate = (dateExpires, t) => {
  if (!dateExpires) {
    return t('noExpiry') || 'No expiry';
  }
  
  try {
    const date = new Date(dateExpires);
    if (isNaN(date.getTime())) {
      return t('noExpiry') || 'No expiry';
    }
    return date.toLocaleDateString();
  } catch (error) {
    return t('noExpiry') || 'No expiry';
  }
};

/**
 * Get status badge configuration
 * @param {string} status - Coupon status
 * @returns {Object} Status badge configuration
 */
export const getStatusConfig = (status) => {
  const isActive = status === 'publish';
  return {
    isActive,
    className: isActive
      ? 'bg-green-100 text-green-800'
      : 'bg-gray-100 text-gray-800',
    label: isActive ? 'active' : 'inactive'
  };
};
