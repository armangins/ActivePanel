import { useState, useCallback } from 'react';

/**
 * Custom hook for managing product form state
 * @param {Object} initialFormData - Initial form data
 * @returns {Object} - Form state and handlers
 */
export const useProductForm = (initialFormData = {}) => {
  const [formData, setFormData] = useState({
    name: '',
    description: '',
    short_description: '',
    regular_price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    categories: [],
    images: [],
    attributes: [],
    tags: [],
    date_on_sale_from: '',
    date_on_sale_to: '',
    ...initialFormData
  });

  const [errors, setErrors] = useState({});
  const [saving, setSaving] = useState(false);

  const updateFormData = useCallback((updates) => {
    setFormData(prev => ({
      ...prev,
      ...(typeof updates === 'function' ? updates(prev) : updates)
    }));
  }, []);

  const updateField = useCallback((field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
  }, []);

  const setFormErrors = useCallback((newErrors) => {
    setErrors(newErrors);
  }, []);

  const clearErrors = useCallback(() => {
    setErrors({});
  }, []);

  const resetForm = useCallback((newData = {}) => {
    setFormData({
      name: '',
      description: '',
      short_description: '',
      regular_price: '',
      sale_price: '',
      sku: '',
      stock_quantity: '',
      categories: [],
      images: [],
      attributes: [],
      tags: [],
      date_on_sale_from: '',
      date_on_sale_to: '',
      ...newData
    });
    setErrors({});
  }, []);

  return {
    formData,
    errors,
    saving,
    setFormData,
    updateFormData,
    updateField,
    setErrors: setFormErrors,
    clearErrors,
    setSaving,
    resetForm
  };
};





