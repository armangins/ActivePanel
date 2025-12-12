/**
 * Price Helpers
 * 
 * Shared utility functions for price calculations in list view
 * Prevents code duplication between PriceCell and other components
 */

/**
 * Calculate price range for variable products
 * @param {Array} variations - Array of variation objects
 * @returns {Object} Object with minPrice and maxPrice, or null if no prices
 */
export const calculateVariationPriceRange = (variations) => {
  if (!variations || !Array.isArray(variations) || variations.length === 0) {
    return null;
  }

  // Use only regular_price - do not use 'price' field as it may include tax calculations
  const prices = variations
    .map(v => {
      const priceValue = v.regular_price || 0;
      return parseFloat(priceValue);
    })
    .filter(p => p > 0);

  if (prices.length === 0) {
    return null;
  }

  return {
    minPrice: Math.min(...prices),
    maxPrice: Math.max(...prices)
  };
};

/**
 * Format price range string
 * @param {number} minPrice - Minimum price
 * @param {number} maxPrice - Maximum price
 * @param {Function} formatCurrency - Currency formatting function
 * @returns {string} Formatted price range
 */
export const formatPriceRange = (minPrice, maxPrice, formatCurrency) => {
  if (minPrice === maxPrice) {
    return formatCurrency(minPrice);
  }
  return `${formatCurrency(minPrice)} - ${formatCurrency(maxPrice)}`;
};

/**
 * Check if product has sale price
 * @param {Object} product - Product object
 * @returns {boolean} True if product has sale price
 */
export const hasSalePrice = (product) => {
  return product.sale_price && parseFloat(product.sale_price) > 0;
};

/**
 * Get sale price value
 * @param {Object} product - Product object
 * @returns {number|null} Sale price value or null
 */
export const getSalePrice = (product) => {
  if (!hasSalePrice(product)) {
    return null;
  }
  return parseFloat(product.sale_price);
};

/**
 * Get regular price value
 * @param {Object} product - Product object
 * @returns {number} Regular price value (defaults to 0)
 */
export const getRegularPrice = (product) => {
  return parseFloat(product.regular_price || 0);
};

