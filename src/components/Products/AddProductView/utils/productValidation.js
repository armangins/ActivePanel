/**
 * Product Validation Utilities
 * 
 * Pure functions for validating product form data
 */

/**
 * Validate product form data
 * @param {Object} formData - Product form data
 * @param {Function} t - Translation function
 * @returns {Object} - Object with isValid boolean and errors object
 */
export const validateProductForm = (formData, t) => {
  const errors = {};

  // Name validation
  if (!formData.name?.trim()) {
    errors.name = t('requiredField') || 'Required';
  } else if (formData.name.length > 20) {
    errors.name = t('max20Characters') || 'Maximum 20 characters';
  }

  // Categories validation
  if (!formData.categories || formData.categories.length === 0) {
    errors.categories = t('requiredField') || 'Required';
  }

  // Regular price validation
  if (!formData.regular_price) {
    errors.regular_price = t('requiredField') || 'Required';
  }

  // Stock quantity validation
  if (!formData.stock_quantity || formData.stock_quantity === '') {
    errors.stock_quantity = t('requiredField') || 'Required';
  }

  // Images validation
  if (!formData.images || formData.images.length < 1) {
    errors.images = t('min1Image') || 'At least 1 image required';
  }

  // Description word count validation
  if (formData.description) {
    const wordCount = formData.description.trim().split(/\s+/).filter(word => word.length > 0).length;
    if (wordCount > 400) {
      errors.description = t('max400Words') || 'Maximum 400 words allowed';
    }
  }

  return {
    isValid: Object.keys(errors).length === 0,
    errors
  };
};



