import { useState, useCallback } from 'react';
import { variationsAPI } from '../../../../../../services/woocommerce';
import { buildVariationData } from '../../../utils/productBuilders';

/**
 * Custom hook for managing product variations
 * @returns {Object} - Variations state and handlers
 */
export const useVariations = () => {
  const [variations, setVariations] = useState([]);
  const [pendingVariations, setPendingVariations] = useState([]);
  const [deletedVariationIds, setDeletedVariationIds] = useState([]); // Track deleted variation IDs
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

  // Delete a saved variation (for edit mode)
  const handleDeleteVariation = useCallback((variationId) => {
    if (variationId && typeof variationId === 'number') {
      // Track deleted variation ID
      setDeletedVariationIds(prev => [...prev, variationId]);
      // Remove from variations list
      setVariations(prev => prev.filter(v => v.id !== variationId));
    }
  }, []);

  // Clear deleted variations tracking
  const clearDeletedVariations = useCallback(() => {
    setDeletedVariationIds([]);
  }, []);

  const createVariation = useCallback(async ({
    isEditMode,
    productId,
    formData,
    attributes,
    attributeTerms,
    parentSku,
    existingVariationSkus = [],
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

    // Check if stock quantity is set
    const stockQuantity = variationFormData.stock_quantity;
    if (stockQuantity === '' || stockQuantity === null || stockQuantity === undefined) {
      alert(t('stockQuantityRequired') || 'כמות במלאי היא שדה חובה');
      return false;
    }

    // Validate SKU for duplicates
    const currentSku = (variationFormData.sku || '').trim();
    if (currentSku) {
      // Check against parent SKU
      if (parentSku && currentSku === parentSku.trim()) {
        alert(t('skuCannotMatchParent') || 'המק״ט לא יכול להיות זהה למק״ט האב');
        return false;
      }

      // Check against other variations
      const hasDuplicate = existingVariationSkus.some(sku => {
        return sku && sku.trim() === currentSku;
      });

      if (hasDuplicate) {
        alert(t('skuAlreadyUsedByVariation') || 'מק״ט זה כבר בשימוש על ידי וריאציה אחרת');
        return false;
      }
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
    parentSku,
    existingVariationSkus = [],
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

    // Check if stock quantity is set
    const stockQuantity = variationFormData.stock_quantity;
    if (stockQuantity === '' || stockQuantity === null || stockQuantity === undefined) {
      alert(t('stockQuantityRequired') || 'כמות במלאי היא שדה חובה');
      return false;
    }

    // Validate SKU for duplicates
    const currentSku = (variationFormData.sku || '').trim();
    if (currentSku) {
      // Check against parent SKU
      if (parentSku && currentSku === parentSku.trim()) {
        alert(t('skuCannotMatchParent') || 'המק״ט לא יכול להיות זהה למק״ט האב');
        return false;
      }

      // Check against other variations (excluding current one)
      const hasDuplicate = existingVariationSkus.some(sku => {
        return sku && sku.trim() === currentSku;
      });

      if (hasDuplicate) {
        alert(t('skuAlreadyUsedByVariation') || 'מק״ט זה כבר בשימוש על ידי וריאציה אחרת');
        return false;
      }
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

      // Check if this is a pending variation
      const isPending = pendingVariations.some(v => v.id === editingVariationId);

      if (isPending) {
        // Update locally
        setPendingVariations(prev => prev.map(v =>
          v.id === editingVariationId
            ? {
              ...v,
              ...variationData,
              image: variationFormData.image || null,
              // Ensure we preserve the ID
              id: editingVariationId
            }
            : v
        ));
      } else if (productId && editingVariationId) {
        // Update via API (only if product exists and variation has a real ID)
        await variationsAPI.update(productId, editingVariationId, variationData);
        await loadVariations(productId);
      } else {
        // This shouldn't happen, but handle gracefully
        alert(t('cannotUpdateVariation') || 'לא ניתן לעדכן וריאציה זו');
        return false;
      }

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
  }, [variationFormData, resetVariationForm, loadVariations, pendingVariations]);

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
    deletedVariationIds,
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
    handleDeleteVariation,
    clearDeletedVariations,
    createVariation,
    updateVariation,
    clearPendingVariations,
    clearVariations
  };
};





