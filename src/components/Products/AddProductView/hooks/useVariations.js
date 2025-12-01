import { useState, useCallback } from 'react';
import { variationsAPI } from '../../../../services/woocommerce';
import { buildVariationData } from '../utils/productBuilders';

/**
 * Custom hook for managing product variations
 * @returns {Object} - Variations state and handlers
 */
export const useVariations = () => {
  const [variations, setVariations] = useState([]);
  const [pendingVariations, setPendingVariations] = useState([]);
  const [loadingVariations, setLoadingVariations] = useState(false);
  const [showCreateVariationModal, setShowCreateVariationModal] = useState(false);
  const [showEditVariationModal, setShowEditVariationModal] = useState(false);
  const [editingVariationId, setEditingVariationId] = useState(null);
  const [creatingVariation, setCreatingVariation] = useState(false);
  const [variationFormData, setVariationFormData] = useState({
    attributes: {},
    regular_price: '',
    sale_price: '',
    sku: '',
    stock_quantity: '',
    image: null,
  });

  const loadVariations = useCallback(async (productId) => {
    if (!productId) return;

    setLoadingVariations(true);
    try {
      const variationsData = await variationsAPI.getByProductId(productId);
      setVariations(variationsData || []);
    } catch (err) {
      // Failed to load variations
      setVariations([]);
    } finally {
      setLoadingVariations(false);
    }
  }, []);

  const resetVariationForm = useCallback(() => {
    setVariationFormData({
      attributes: {},
      regular_price: '',
      sale_price: '',
      sku: '',
      stock_quantity: '',
      image: null,
    });
  }, []);

  const handleDeletePendingVariation = useCallback((tempId) => {
    setPendingVariations(prev => prev.filter(v => v.id !== tempId));
  }, []);

  const createVariation = useCallback(async ({
    isEditMode,
    productId,
    formData,
    attributes,
    attributeTerms,
    t
  }) => {
    // Validate that at least one attribute is selected
    const selectedAttributes = Object.keys(variationFormData.attributes).filter(
      attrId => variationFormData.attributes[attrId]
    );

    if (selectedAttributes.length === 0) {
      alert(t('selectAtLeastOneAttribute') || 'אנא בחר לפחות תכונה אחת');
      return false;
    }

    // Check if regular price is set
    const regularPrice = variationFormData.regular_price || formData.regular_price || '';
    if (!regularPrice) {
      alert(t('regularPriceRequired') || 'מחיר רגיל הוא שדה חובה');
      return false;
    }

    setCreatingVariation(true);
    try {
      const variationData = buildVariationData({
        variationFormData,
        selectedAttributes,
        attributes,
        attributeTerms,
        parentRegularPrice: formData.regular_price,
        parentSalePrice: formData.sale_price
      });

      // If in edit mode and product exists, save to WooCommerce immediately
      if (isEditMode && productId) {
        await variationsAPI.create(productId, variationData);
        await loadVariations(productId);
      } else {
        // In add mode, save locally with temporary ID
        const tempVariation = {
          id: `temp-${Date.now()}-${Math.random()}`,
          ...variationData,
          image: variationFormData.image || null,
        };
        setPendingVariations(prev => [...prev, tempVariation]);
      }

      resetVariationForm();
      setShowCreateVariationModal(false);
      return true;
    } catch (error) {
      alert(t('error') + ': ' + (error.message || t('failedToCreateVariation') || 'נכשל ביצירת וריאציה'));
      return false;
    } finally {
      setCreatingVariation(false);
    }
  }, [variationFormData, resetVariationForm, loadVariations]);

  const updateVariation = useCallback(async ({
    productId,
    editingVariationId,
    formData,
    attributes,
    attributeTerms,
    t
  }) => {
    // Validate that at least one attribute is selected
    const selectedAttributes = Object.keys(variationFormData.attributes).filter(
      attrId => variationFormData.attributes[attrId]
    );

    if (selectedAttributes.length === 0) {
      alert(t('selectAtLeastOneAttribute') || 'אנא בחר לפחות תכונה אחת');
      return false;
    }

    const regularPrice = variationFormData.regular_price || formData.regular_price || '';
    if (!regularPrice) {
      alert(t('regularPriceRequired') || 'מחיר רגיל הוא שדה חובה');
      return false;
    }

    setCreatingVariation(true);
    try {
      const variationData = buildVariationData({
        variationFormData,
        selectedAttributes,
        attributes,
        attributeTerms,
        parentRegularPrice: formData.regular_price,
        parentSalePrice: formData.sale_price
      });

      await variationsAPI.update(productId, editingVariationId, variationData);
      await loadVariations(productId);

      resetVariationForm();
      setShowEditVariationModal(false);
      setEditingVariationId(null);
      return true;
    } catch (error) {
      alert(t('error') + ': ' + (error.message || t('failedToCreateVariation') || 'נכשל בעדכון וריאציה'));
      return false;
    } finally {
      setCreatingVariation(false);
    }
  }, [variationFormData, resetVariationForm, loadVariations]);

  const clearPendingVariations = useCallback(() => {
    setPendingVariations([]);
  }, []);

  const clearVariations = useCallback(() => {
    setVariations([]);
    setPendingVariations([]);
  }, []);

  return {
    variations,
    pendingVariations,
    loadingVariations,
    showCreateVariationModal,
    showEditVariationModal,
    editingVariationId,
    creatingVariation,
    variationFormData,
    setVariations,
    setPendingVariations,
    setShowCreateVariationModal,
    setShowEditVariationModal,
    setEditingVariationId,
    setVariationFormData,
    loadVariations,
    resetVariationForm,
    handleDeletePendingVariation,
    createVariation,
    updateVariation,
    clearPendingVariations,
    clearVariations
  };
};



