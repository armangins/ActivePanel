import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { productsAPI, categoriesAPI, attributesAPI } from '../../../../services/woocommerce';
import { useCategories } from '../../../../hooks/useCategories';
import { useProduct } from '../../../../hooks/useProducts';
import { mapProductAttributesToTerms } from '../utils/attributeHelpers';
import { secureLog } from '../../../../utils/logger';

/**
 * Custom hook for loading product data and categories
 * @param {Object} params - Parameters
 * @param {string|null} params.productId - Product ID (null for add mode)
 * @param {boolean} params.isEditMode - Whether in edit mode
 * @param {string} params.productType - Product type (simple/variable)
 * @param {Function} params.setFormData - Function to set form data
 * @param {Function} params.setProductType - Function to set product type
 * @param {Function} params.setScheduleDates - Function to set schedule dates
 * @param {Function} params.setOriginalProductAttributes - Function to set original attributes
 * @param {Function} params.setSelectedAttributeIds - Function to set selected attribute IDs
 * @param {Function} params.setSelectedAttributeTerms - Function to set selected attribute terms
 * @param {Function} params.loadAttributeTerms - Function to load attribute terms
 * @param {Function} params.loadVariations - Function to load variations
 * @returns {Object} - Loading state and data
 */
export const useProductData = ({
  productId,
  isEditMode,
  productType,
  setFormData, // Deprecated, use resetForm/setValue
  resetForm,
  setValue,
  setProductType,
  setScheduleDates,
  setOriginalProductAttributes,
  setSelectedAttributeIds,
  setSelectedAttributeTerms,
  loadAttributeTerms,
  loadVariations
}) => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();

  // Use hooks for data fetching
  const {
    data: categories = [],
    isLoading: loadingCategories,
    refetch: loadCategories
  } = useCategories();

  const {
    data: product,
    isLoading: loadingProductData,
    refetch: refetchProduct
  } = useProduct(isEditMode ? productId : null);

  const [processingProduct, setProcessingProduct] = useState(false);
  const loadingProduct = loadingProductData || processingProduct;

  // Process product data when it changes
  useEffect(() => {
    const processProductData = async () => {
      if (!product || !isEditMode) return;

      setProcessingProduct(true);
      try {
        // Set product type dynamically
        setProductType(product.type || 'simple');

        // Map product data to formData structure
        // SECURITY & ACCURACY: Format prices properly - only use regular_price, not price field
        // WooCommerce may return price field with tax calculations, so we ignore it
        const formatPriceForForm = (priceValue) => {
          if (!priceValue) return '';
          // Convert to number and format to 2 decimal places
          const numPrice = parseFloat(priceValue);
          if (isNaN(numPrice)) return '';
          return numPrice.toFixed(2);
        };

        const formattedData = {
          product_name: product.name || '',
          status: product.status || 'draft',
          description: product.description || '',
          short_description: product.short_description || '',
          // Only use regular_price, ignore price field (may include tax)
          regular_price: formatPriceForForm(product.regular_price),
          sale_price: formatPriceForForm(product.sale_price),
          sku: product.sku || '',
          manage_stock: product.manage_stock ?? true,
          stock_status: product.stock_status || 'instock',
          stock_quantity: product.stock_quantity?.toString() || '',
          categories: product.categories?.map(cat => cat.id) || [],
          images: product.images || [],
          attributes: product.attributes || [],
          tags: product.tags?.map(tag => tag.id) || [],
          date_on_sale_from: product.date_on_sale_from || '',
          date_on_sale_to: product.date_on_sale_to || '',
          requires_shipping: !product.virtual,
          weight: product.weight || '',
          dimensions: product.dimensions || { length: '', width: '', height: '' },
          shipping_class: product.shipping_class || '',
          tax_status: product.tax_status || 'taxable',
          tax_class: product.tax_class || '',
        };

        if (resetForm) {
          resetForm(formattedData);
        } else if (setFormData) {
          setFormData(formattedData);
        }

        // Load variations if it's a variable product
        if (product.type === 'variable') {
          loadVariations(product.id);
        }

        // Set schedule dates if they exist
        if (product.date_on_sale_from || product.date_on_sale_to) {
          setScheduleDates({
            start: product.date_on_sale_from || '',
            end: product.date_on_sale_to || ''
          });
        }

        // Store original product attributes for later use
        if (product.attributes && product.attributes.length > 0) {
          setOriginalProductAttributes(product.attributes);
        }

        // Load and set selected attributes and terms (only if product type is variable)
        if (product.type === 'variable' && product.attributes && product.attributes.length > 0) {
          const selectedIds = product.attributes.map(attr => attr.id);
          setSelectedAttributeIds(selectedIds);

          // Map attributes to terms
          const termsMap = await mapProductAttributesToTerms(
            product.attributes,
            async (attributeId) => {
              await loadAttributeTerms(attributeId);
              return await attributesAPI.getTerms(attributeId);
            }
          );
          setSelectedAttributeTerms(termsMap);
        }
      } catch (err) {
        secureLog.error('Error processing product data', err);
        // navigate('/products'); // Don't navigate away on processing error, let user try again
      } finally {
        setProcessingProduct(false);
      }
    };

    processProductData();
  }, [product, isEditMode, setFormData, resetForm, setProductType, setScheduleDates, setOriginalProductAttributes, setSelectedAttributeIds, setSelectedAttributeTerms, loadAttributeTerms, loadVariations]);

  // Manual load function (wrapper around refetch)
  const loadProduct = useCallback((id) => {
    if (id) refetchProduct();
  }, [refetchProduct]);

  // Handle price param from calculator (only in add mode)
  useEffect(() => {
    if (!isEditMode) {
      const priceParam = searchParams.get('price');
      if (priceParam) {
        const price = parseFloat(priceParam);
        if (!isNaN(price) && price > 0) {
          const priceVal = price.toFixed(2);
          if (setValue) {
            setValue('regular_price', priceVal);
          } else if (setFormData) {
            setFormData(prev => ({
              ...prev,
              regular_price: priceVal
            }));
          }
        }
      }
    }
  }, [isEditMode, searchParams, setFormData, setValue]);

  return {
    categories,
    loadingProduct,
    loadingCategories,
    loadCategories,
    loadProduct
  };
};

