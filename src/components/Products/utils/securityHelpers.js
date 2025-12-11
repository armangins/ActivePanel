/**
 * Security Helpers
 * 
 * Utility functions for security best practices in product views
 * Prevents XSS attacks and validates user data
 */

/**
 * Sanitize string to prevent XSS attacks
 * Escapes HTML special characters
 * @param {string} str - String to sanitize
 * @returns {string} Sanitized string
 */
export const sanitizeString = (str) => {
  if (typeof str !== 'string') {
    return '';
  }
  
  const map = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#x27;',
    '/': '&#x2F;',
  };
  
  return str.replace(/[&<>"'/]/g, (char) => map[char]);
};

/**
 * Validate and sanitize image URL
 * Prevents javascript: and data: URL schemes
 * @param {string} url - Image URL to validate
 * @returns {string|null} Validated URL or null if invalid
 */
export const validateImageUrl = (url) => {
  if (!url || typeof url !== 'string') {
    return null;
  }
  
  // Remove whitespace
  const trimmedUrl = url.trim();
  
  // Check for dangerous URL schemes
  const dangerousSchemes = ['javascript:', 'data:', 'vbscript:', 'file:'];
  const lowerUrl = trimmedUrl.toLowerCase();
  
  for (const scheme of dangerousSchemes) {
    if (lowerUrl.startsWith(scheme)) {
      return null;
    }
  }
  
  // Allow http, https, and relative URLs
  if (
    trimmedUrl.startsWith('http://') ||
    trimmedUrl.startsWith('https://') ||
    trimmedUrl.startsWith('/') ||
    trimmedUrl.startsWith('./') ||
    trimmedUrl.startsWith('../')
  ) {
    return trimmedUrl;
  }
  
  // If no scheme, assume relative URL
  if (!trimmedUrl.includes('://')) {
    return trimmedUrl;
  }
  
  return null;
};

/**
 * Validate product ID
 * Ensures ID is a valid number or numeric string
 * @param {*} id - Product ID to validate
 * @returns {number|null} Valid ID or null
 */
export const validateProductId = (id) => {
  if (id === null || id === undefined) {
    return null;
  }
  
  const numId = typeof id === 'number' ? id : parseInt(id, 10);
  
  if (isNaN(numId) || numId <= 0 || !isFinite(numId)) {
    return null;
  }
  
  return numId;
};

/**
 * Sanitize product name for display
 * Escapes HTML and limits length
 * @param {string} name - Product name
 * @param {number} maxLength - Maximum length (default: 200)
 * @returns {string} Sanitized product name
 */
export const sanitizeProductName = (name, maxLength = 200) => {
  if (!name || typeof name !== 'string') {
    return '';
  }
  
  const sanitized = sanitizeString(name);
  
  if (sanitized.length > maxLength) {
    return sanitized.substring(0, maxLength) + '...';
  }
  
  return sanitized;
};

/**
 * Sanitize SKU for display
 * Escapes HTML and validates format
 * @param {string} sku - SKU string
 * @returns {string} Sanitized SKU
 */
export const sanitizeSKU = (sku) => {
  if (!sku || typeof sku !== 'string') {
    return '';
  }
  
  // Remove any HTML tags and escape
  return sanitizeString(sku.trim());
};

/**
 * Sanitize category name
 * @param {string} categoryName - Category name
 * @returns {string} Sanitized category name
 */
export const sanitizeCategoryName = (categoryName) => {
  if (!categoryName || typeof categoryName !== 'string') {
    return '-';
  }
  
  return sanitizeString(categoryName.trim());
};

/**
 * Sanitize attribute values for display
 * @param {string} value - Attribute value
 * @returns {string} Sanitized value
 */
export const sanitizeAttributeValue = (value) => {
  if (!value || typeof value !== 'string') {
    return '';
  }
  
  return sanitizeString(value.trim());
};

/**
 * Validate product object structure
 * Ensures product has required fields and valid types
 * @param {Object} product - Product object to validate
 * @returns {boolean} True if product is valid
 */
export const validateProduct = (product) => {
  if (!product || typeof product !== 'object') {
    return false;
  }
  
  // Check for required fields
  if (!product.id || !validateProductId(product.id)) {
    return false;
  }
  
  // Validate name exists and is string
  if (product.name && typeof product.name !== 'string') {
    return false;
  }
  
  return true;
};
