import { productSchema } from '../../../../schemas/product';

/**
 * Product Validation Utilities
 * 
 * Pure functions for validating product form data
 */

/**
 * Validate product form data using Zod schema
 * @param {Object} formData - Form data to validate
 * @param {Function} t - Translation function
 * @returns {Object} { isValid: boolean, errors: Object }
 */
export const validateProductForm = (formData, t) => {
  const result = productSchema.safeParse(formData);

  if (!result.success) {
    const errors = {};
    result.error.issues.forEach((issue) => {
      // Map Zod path to form field names
      const path = issue.path[0];
      if (path) {
        errors[path] = issue.message;
      }
    });

    return {
      isValid: false,
      errors
    };
  }

  return {
    isValid: true,
    errors: {}
  };
};







