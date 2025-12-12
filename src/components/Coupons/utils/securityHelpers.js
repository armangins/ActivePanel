/**
 * Security Helpers for Coupons
 * 
 * Utility functions for security best practices in coupon views
 * Prevents XSS attacks and validates coupon data
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
 * Sanitize coupon code for display
 * Escapes HTML and validates format
 * @param {string} code - Coupon code
 * @returns {string} Sanitized coupon code
 */
export const sanitizeCouponCode = (code) => {
  if (!code || typeof code !== 'string') {
    return '';
  }
  
  // Remove any HTML tags and escape
  return sanitizeString(code.trim());
};

/**
 * Validate coupon ID
 * Ensures ID is a valid number or numeric string
 * @param {*} id - Coupon ID to validate
 * @returns {number|null} Valid ID or null
 */
export const validateCouponId = (id) => {
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
 * Validate coupon object structure
 * Ensures coupon has required fields and valid types
 * @param {Object} coupon - Coupon object to validate
 * @returns {boolean} True if coupon is valid
 */
export const validateCoupon = (coupon) => {
  if (!coupon || typeof coupon !== 'object') {
    return false;
  }
  
  // Check for required fields
  if (!coupon.id || !validateCouponId(coupon.id)) {
    return false;
  }
  
  // Validate code exists and is string
  if (coupon.code && typeof coupon.code !== 'string') {
    return false;
  }
  
  return true;
};

/**
 * Sanitize coupon amount for display
 * @param {*} amount - Coupon amount
 * @returns {string} Sanitized amount string
 */
export const sanitizeAmount = (amount) => {
  if (amount === null || amount === undefined) {
    return '0';
  }
  
  const numAmount = typeof amount === 'number' ? amount : parseFloat(amount);
  
  if (isNaN(numAmount) || !isFinite(numAmount)) {
    return '0';
  }
  
  return String(numAmount);
};

