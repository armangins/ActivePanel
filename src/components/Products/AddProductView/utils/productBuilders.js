/**
 * Product Data Builders
 * 
 * Pure functions for building product data structures for WooCommerce API
 */

import { sanitizeInput } from '../../../../utils/security';

/**
 * Build product data object from form state
 * @param {Object} params - Parameters
 * @param {Object} params.formData - Form data
 * @param {string} params.productType - Product type (simple/variable)
 * @param {Object} params.selectedAttributeTerms - Selected attribute terms
 * @param {Array} params.attributes - Available attributes
 * @param {Object} params.attributeTerms - Attribute terms map
 * @param {string} params.status - Product status (draft/publish)
 * @returns {Object} - Product data ready for WooCommerce API
 */
export const buildProductData = ({
  formData,
  productType = 'simple',
  selectedAttributeTerms = {},
  attributes = [],
  attributeTerms = {},
  status = 'draft'
}) => {
  const productData = {
    name: sanitizeInput(formData.name),
    type: productType || 'simple',
    status: status,
    description: sanitizeInput(formData.description || ''),
    short_description: sanitizeInput(formData.short_description || ''),
    // Variable products don't have prices at parent level - prices come from variations
    // Format prices as strings with 2 decimal places for WooCommerce API
    regular_price: productType === 'variable' ? '' : (formData.regular_price ? parseFloat(formData.regular_price).toFixed(2) : ''),
    sale_price: productType === 'variable' ? '' : (formData.sale_price ? parseFloat(formData.sale_price).toFixed(2) : ''),
    sku: sanitizeInput(formData.sku || ''),
    // For variable products, force manage_stock to false if no stock quantity is provided
    // This prevents "manage_stock: true, stock_quantity: null" which causes WooCommerce 400 Error
    manage_stock: productType === 'variable' && !formData.stock_quantity
      ? false
      : (formData.manage_stock ?? true),

    stock_quantity: (productType === 'variable' && !formData.stock_quantity)
      ? null
      : ((formData.manage_stock ?? true) ? (formData.stock_quantity || null) : null),

    stock_status: (formData.manage_stock ?? true)
      ? (formData.stock_quantity > 0 ? 'instock' : 'outofstock')
      : (formData.stock_status || 'instock'),
    categories: (formData.categories || []).map(id => ({ id })),
    images: (formData.images || []).map(img => ({ id: img.id })),
    virtual: !formData.requires_shipping,
    date_on_sale_from: formData.date_on_sale_from || null,
    date_on_sale_to: formData.date_on_sale_to || null,
    weight: formData.weight || '',
    dimensions: formData.dimensions || { length: '', width: '', height: '' },
    shipping_class: formData.shipping_class || '',
    tax_status: formData.tax_status || 'taxable',
    tax_class: formData.tax_class || '',
  };

  // Add attributes if any
  const productAttributes = [];
  for (const [attributeId, termIds] of Object.entries(selectedAttributeTerms)) {
    if (termIds && termIds.length > 0) {
      const attribute = attributes.find(attr => attr.id === parseInt(attributeId));
      if (attribute) {
        const selectedTerms = termIds
          .map(termId => {
            const term = attributeTerms[attributeId]?.find(t => t.id === termId);
            return term?.name || termId;
          })
          .filter(Boolean);

        if (selectedTerms.length > 0) {
          productAttributes.push({
            id: attribute.id,
            name: attribute.name,
            options: selectedTerms,
            variation: productType === 'variable',
            visible: true,
          });
        }
      }
    }
  }

  if (productAttributes.length > 0) {
    productData.attributes = productAttributes;
  }

  return productData;
};

/**
 * Build variation data object for WooCommerce API
 * @param {Object} params - Parameters
 * @param {Object} params.variationFormData - Variation form data
 * @param {Array} params.selectedAttributes - Selected attribute IDs
 * @param {Array} params.attributes - Available attributes
 * @param {Object} params.attributeTerms - Attribute terms map
 * @param {string} params.parentRegularPrice - Parent product regular price (fallback)
 * @param {string} params.parentSalePrice - Parent product sale price (fallback)
 * @returns {Object} - Variation data ready for WooCommerce API
 */
export const buildVariationData = ({
  variationFormData,
  selectedAttributes = [],
  attributes = [],
  attributeTerms = {},
  parentRegularPrice = '',
  parentSalePrice = ''
}) => {
  // Build attributes array for WooCommerce
  const variationAttributes = selectedAttributes.map(attributeId => {
    const attribute = attributes.find(attr => attr.id === parseInt(attributeId));
    const termId = variationFormData.attributes[attributeId];
    const term = attributeTerms[attributeId]?.find(t => t.id === termId);

    return {
      id: parseInt(attributeId),
      name: attribute?.name || '',
      option: term ? term.name : ''
    };
  });

  // Use variation form prices, or fallback to parent product prices if empty
  // Ensure prices are properly formatted as strings (WooCommerce expects string format)
  const regularPrice = variationFormData.regular_price || parentRegularPrice || '';
  const salePrice = variationFormData.sale_price || parentSalePrice || '';

  // Convert to string and ensure proper decimal format (WooCommerce API requirement)
  const formatPriceForWooCommerce = (price) => {
    if (!price || price === '') return '';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '';
    // Return as string with 2 decimal places
    return numPrice.toFixed(2);
  };

  const variationData = {
    attributes: variationAttributes,
    regular_price: formatPriceForWooCommerce(regularPrice),
    sale_price: formatPriceForWooCommerce(salePrice),
    sku: sanitizeInput(variationFormData.sku || ''),
    manage_stock: variationFormData.stock_quantity !== '' && variationFormData.stock_quantity !== null,
    stock_quantity: variationFormData.stock_quantity || null,
    stock_status: variationFormData.stock_quantity > 0 ? 'instock' : 'outofstock',
  };

  // Add image if uploaded
  if (variationFormData.image && variationFormData.image.id) {
    variationData.image = { id: variationFormData.image.id };
  }

  return variationData;
};

/**
 * Clean variation data for WooCommerce API
 * @param {Object} variationData - Variation data to clean
 * @returns {Object} - Cleaned variation data
 */
export const cleanVariationData = (variationData) => {
  const { id: tempId, ...rest } = variationData;

  // Format prices as strings with 2 decimal places for WooCommerce API
  const formatPriceForWooCommerce = (price) => {
    if (!price || price === '') return '';
    const numPrice = parseFloat(price);
    if (isNaN(numPrice)) return '';
    return numPrice.toFixed(2);
  };

  return {
    regular_price: formatPriceForWooCommerce(rest.regular_price),
    sale_price: formatPriceForWooCommerce(rest.sale_price),
    sku: sanitizeInput(rest.sku || ''),
    manage_stock: rest.manage_stock !== undefined
      ? rest.manage_stock
      : (rest.stock_quantity !== '' && rest.stock_quantity !== null),
    stock_quantity: rest.stock_quantity || null,
    stock_status: rest.stock_status || (rest.stock_quantity > 0 ? 'instock' : 'outofstock'),
    attributes: (rest.attributes || []).map(attr => ({
      id: attr.id,
      name: attr.name,
      option: attr.option
    })),
    ...(rest.image?.id && { image: { id: rest.image.id } })
  };
};








