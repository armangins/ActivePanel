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
      const response = await variationsAPI.list(productId);
      setVariations(response.data || []);
    } catch (err) {
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

  /**
   * Helper to validate variation form data
   */
  const validateVariation = useCallback(({
    parentSku,
    existingVariationSkus,
    t
  }) => {
    const selectedAttributes = Object.keys(variationFormData.attributes).filter(
      attrId => variationFormData.attributes[attrId]
    );

    if (selectedAttributes.length === 0) {
      alert(t('selectAtLeastOneAttribute') || 'אנא בחר לפחות תכונה אחת');
      return null;
    }

    if (!variationFormData.regular_price) {
      alert(t('regularPriceRequired') || 'מחיר רגיל הוא שדה חובה');
      return null;
    }

    if (variationFormData.stock_quantity === '' || variationFormData.stock_quantity === null || variationFormData.stock_quantity === undefined) {
      alert(t('stockQuantityRequired') || 'כמות במלאי היא שדה חובה');
      return null;
    }

    const currentSku = (variationFormData.sku || '').trim();
    if (currentSku) {
      if (parentSku && currentSku === parentSku.trim()) {
        alert(t('skuCannotMatchParent') || 'המק״ט לא יכול להיות זהה למק״ט האב');
        return null;
      }

      if (existingVariationSkus.some(sku => sku && sku.trim() === currentSku)) {
        alert(t('skuAlreadyUsedByVariation') || 'מק״ט זה כבר בשימוש על ידי וריאציה אחרת');
        return null;
      }
    }

    return selectedAttributes;
  }, [variationFormData]);

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
    const selectedAttributes = validateVariation({ parentSku, existingVariationSkus, t });
    if (!selectedAttributes) return false;

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

      if (isEditMode && productId) {
        await variationsAPI.create(productId, variationData);
        await loadVariations(productId);
      } else {
        setPendingVariations(prev => [...prev, {
          id: `temp-${Date.now()}-${Math.random()}`,
          ...variationData,
          image: variationFormData.image || null,
        }]);
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
  }, [variationFormData, validateVariation, resetVariationForm, loadVariations]);

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
    const selectedAttributes = validateVariation({ parentSku, existingVariationSkus, t });
    if (!selectedAttributes) return false;

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

      const isPending = pendingVariations.some(v => v.id === editingVariationId);

      if (isPending) {
        setPendingVariations(prev => prev.map(v =>
          v.id === editingVariationId ? { ...v, ...variationData, image: variationFormData.image || null, id: editingVariationId } : v
        ));
      } else if (productId && editingVariationId) {
        await variationsAPI.update(productId, editingVariationId, variationData);
        await loadVariations(productId);
      } else {
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
  }, [variationFormData, validateVariation, resetVariationForm, loadVariations, pendingVariations]);

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





