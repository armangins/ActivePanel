/**
 * Order Helper Utilities
 * 
 * Utility functions for working with order data.
 */

/**
 * Get customer name from order object
 * @param {Object} order - Order object
 * @param {Function} t - Translation function (optional)
 * @returns {string} Customer name or fallback text
 */
export const getCustomerName = (order, t) => {
  if (order.billing?.first_name || order.billing?.last_name) {
    return `${order.billing.first_name || ''} ${order.billing.last_name || ''}`.trim();
  }
  return order.billing?.email || order.customer?.email || (t?.('customer') || 'לקוח');
};














