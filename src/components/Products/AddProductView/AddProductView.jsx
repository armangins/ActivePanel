import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { DocumentArrowDownIcon as Save, PlusIcon as Plus, CalculatorIcon as Calculator, ArrowPathIcon as Loader } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';
import { productsAPI, variationsAPI } from '../../../services/woocommerce';
import { generateSKU, improveText } from '../../../services/gemini';
import { Breadcrumbs, Button } from '../../ui';
import { PageTitle } from './sub-components';
import CalculatorModal from '../CalculatorModal';
import { secureLog } from '../../../utils/logger';
import { VariationsSection, ProductImagesSection, AttributesSection, CreateVariationModal, EditVariationModal, ScheduleModal, SuccessModal, ProductDetailsPanel } from './sub-components';
import { useProductForm, useProductData, useAttributes, useVariations, useProductImages } from './hooks';
import { validateProductForm, buildProductData, cleanVariationData, mapProductAttributesToTerms } from './utils';
import { attributesAPI } from '../../../services/woocommerce';

/**
 * AddProductView Component
 * 
 * Unified component for both adding new products and editing existing products.
 * Automatically detects edit mode based on URL parameter (id).
 * 
 * Routes:
 * - /products/add - Add new product
 * - /products/edit/:id - Edit existing product
 */
const AddProductView = () => {
  const { t, isRTL, formatCurrency } = useLanguage();
  const navigate = useNavigate();
  const { id } = useParams();
  const [searchParams] = useSearchParams();

  // Dynamically determine if we're in edit mode based on URL parameter
  const isEditMode = Boolean(id);

  // UI State (modals, etc.)
  const [showScheduleModal, setShowScheduleModal] = useState(false);
  const [scheduleDates, setScheduleDates] = useState({
    start: '',
    end: ''
  });
  const [showCalculatorModal, setShowCalculatorModal] = useState(false);
  const [selectedDiscount, setSelectedDiscount] = useState('');
  const [productType, setProductType] = useState('simple');
  const [generatingSKU, setGeneratingSKU] = useState(false);
  const [improvingShortDescription, setImprovingShortDescription] = useState(false);
  const [improvingDescription, setImprovingDescription] = useState(false);
  const [showSuccessModal, setShowSuccessModal] = useState(false);

  // Form State Management Hook
  const {
    formData,
    errors,
    saving,
    setFormData,
    updateFormData,
    updateField,
    setErrors,
    clearErrors,
    setSaving
  } = useProductForm();

  // Attributes Hook
  const {
    attributes,
    attributeTerms,
    selectedAttributeIds,
    selectedAttributeTerms,
    loadingAttributes,
    originalProductAttributes,
    setAttributes,
    setAttributeTerms,
    setSelectedAttributeIds,
    setSelectedAttributeTerms,
    setOriginalProductAttributes,
    loadAttributes,
    loadAttributeTerms,
    toggleAttribute,
    toggleAttributeTerm,
    isAttributeSelected,
    isTermSelected,
    clearAttributes,
    resetAttributes
  } = useAttributes();

  // Variations Hook
  const {
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
  } = useVariations();

  // Product Images Hook
  const {
    uploadingImage,
    handleImageUpload: handleImageUploadBase,
    removeImage: removeImageBase
  } = useProductImages();

  // Product Data Hook (depends on attributes and variations hooks)
  const {
    categories,
    loadingProduct,
    loadProduct
  } = useProductData({
    productId: id,
    isEditMode,
    productType,
    setFormData,
    setProductType,
    setScheduleDates,
    setOriginalProductAttributes,
    setSelectedAttributeIds,
    setSelectedAttributeTerms,
    loadAttributeTerms,
    loadVariations
  });

  // Load attributes when product type changes to variable
  useEffect(() => {
    if (productType === 'variable') {
      loadAttributes(productType);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productType]);

  // ============================================
  // Wrapper Functions Using Hooks & Utilities
  // ============================================

  /**
   * Handle image upload - wrapper using useProductImages hook
   */
  /**
   * Handle image upload - wrapper using useProductImages hook
   */
  const handleImageUpload = useCallback(async (fileList) => {
    const result = await handleImageUploadBase(fileList, formData.images || [], (updatedImages) => {
      updateField('images', updatedImages);
      clearErrors();
    });

    if (!result.success && result.error) {
      setErrors(prev => ({ ...prev, images: result.error }));
    }
  }, [handleImageUploadBase, formData.images, updateField, clearErrors, setErrors]);

  /**
   * Remove image - wrapper using useProductImages hook
   */
  const removeImage = useCallback((imageId) => {
    removeImageBase(imageId, formData.images || [], (updatedImages) => {
      updateField('images', updatedImages);
    });
  }, [removeImageBase, formData.images, updateField]);

  /**
   * Handle create variation - wrapper using useVariations hook
   */
  const handleCreateVariation = useCallback(async () => {
    await createVariation({
      isEditMode,
      productId: id,
      formData,
      attributes,
      attributeTerms,
      t
    });
  }, [createVariation, isEditMode, id, formData, attributes, attributeTerms, t]);

  /**
   * Handle edit variation - loads variation data into form
   */
  const handleEditVariation = useCallback(async (variation) => {
    setEditingVariationId(variation.id);

    // Initialize attributes from variation
    const attributesMap = {};
    if (variation.attributes && variation.attributes.length > 0) {
      // Load terms for each attribute in the variation
      for (const attr of variation.attributes) {
        await loadAttributeTerms(attr.id);
        // Fetch terms directly from API to ensure we have the latest data
        const terms = await attributesAPI.getTerms(attr.id);
        const matchingTerm = terms?.find(term => term.name === attr.option || term.slug === attr.option);
        if (matchingTerm) {
          attributesMap[attr.id] = matchingTerm.id;
        }
      }
    }

    setVariationFormData({
      attributes: attributesMap,
      regular_price: variation.regular_price || '',
      sale_price: variation.sale_price || '',
      sku: variation.sku || '',
      stock_quantity: variation.stock_quantity?.toString() || '',
      image: variation.image || null,
    });

    setShowEditVariationModal(true);
  }, [setEditingVariationId, loadAttributeTerms, setVariationFormData, setShowEditVariationModal]);

  /**
   * Handle update variation - wrapper using useVariations hook
   */
  const handleUpdateVariation = useCallback(async () => {
    await updateVariation({
      productId: id,
      editingVariationId,
      formData,
      attributes,
      attributeTerms,
      t
    });
  }, [updateVariation, id, editingVariationId, formData, attributes, attributeTerms, t]);

  /**
   * Handle product type change - wrapper using hooks
   */
  const handleProductTypeChange = useCallback(async (newType) => {
    // Prevent changing if already the same type
    if (productType === newType) {
      return;
    }

    // Prevent changing during save
    if (saving) {
      return;
    }

    // Update product type immediately for instant UI feedback
    const previousType = productType;
    setProductType(newType);

    try {
      if (newType === 'simple') {
        // Clear variations and attributes when switching to simple
        clearVariations();
        clearAttributes();
      } else if (newType === 'variable') {
        // Load attributes when switching to variable
        await loadAttributes(newType);

        // If in edit mode and product had attributes, restore them
        if (isEditMode && id && originalProductAttributes.length > 0) {
          const selectedIds = originalProductAttributes.map(attr => attr.id);
          setSelectedAttributeIds(selectedIds);

          // Load terms and map them
          const termsMap = await mapProductAttributesToTerms(
            originalProductAttributes,
            async (attributeId) => {
              await loadAttributeTerms(attributeId);
              return await attributesAPI.getTerms(attributeId);
            }
          );
          setSelectedAttributeTerms(termsMap);
        }

        // Load variations if in edit mode and product exists
        if (isEditMode && id) {
          loadVariations(id);
        } else {
          // In add mode, just clear variations
          setVariations([]);
        }
      }
    } catch (error) {
      // If error occurs, revert to previous type
      setProductType(previousType);
    }
  }, [productType, saving, clearVariations, clearAttributes, loadAttributes, isEditMode, id, originalProductAttributes, setSelectedAttributeIds, loadAttributeTerms, setSelectedAttributeTerms, loadVariations, setVariations]);

  const handleDiscountSelect = useCallback((discount) => {
    setSelectedDiscount(discount);
    if (formData.regular_price) {
      const regularPrice = parseFloat(formData.regular_price);
      if (!isNaN(regularPrice) && regularPrice > 0) {
        const discountPercent = parseFloat(discount);
        const salePrice = regularPrice * (1 - discountPercent / 100);
        setFormData(prev => ({ ...prev, sale_price: salePrice.toFixed(2) }));
      }
    }
  }, [formData.regular_price, setFormData]);

  const handleDiscountClear = useCallback(() => {
    setSelectedDiscount('');
    setFormData(prev => ({ ...prev, sale_price: '' }));
  }, [setFormData]);

  const handleGenerateSKU = useCallback(async () => {
    setGeneratingSKU(true);
    try {
      const generatedSKU = await generateSKU(formData.name);
      setFormData(prev => ({ ...prev, sku: generatedSKU }));
    } catch (error) {
      const fallbackSKU = `PRD-${Date.now().toString(36).toUpperCase().substring(7)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
      setFormData(prev => ({ ...prev, sku: fallbackSKU }));
    } finally {
      setGeneratingSKU(false);
    }
  }, [formData.name, setFormData]);

  const handleImproveShortDescription = useCallback(async () => {
    if (!formData.short_description?.trim()) return;
    setImprovingShortDescription(true);
    try {
      const improved = await improveText(formData.short_description, 'short_description', formData.name);
      const cleaned = improved
        .replace(/<[^>]*>/g, '')
        .replace(/&[a-zA-Z0-9#]+;/g, ' ')
        .replace(/\s+/g, ' ')
        .trim();
      setFormData(prev => ({ ...prev, short_description: cleaned }));
    } catch (error) {
      secureLog.error('Error improving short description', error);
    } finally {
      setImprovingShortDescription(false);
    }
  }, [formData.short_description, formData.name, setFormData]);

  const handleImproveDescription = useCallback(async () => {
    if (!formData.description?.trim()) return;
    setImprovingDescription(true);
    try {
      const improved = await improveText(formData.description, 'description', formData.name);
      const cleaned = improved.replace(/<[^>]*>/g, '').trim();
      const words = cleaned.split(/\s+/).filter(word => word.length > 0);
      const limitedWords = words.slice(0, 400).join(' ');
      setFormData(prev => ({ ...prev, description: limitedWords }));
    } catch (error) {
      secureLog.error('Error improving description', error);
    } finally {
      setImprovingDescription(false);
    }
  }, [formData.description, formData.name, setFormData]);

  /**
   * Validate form - wrapper using utility
   */
  const validateForm = () => {
    const { isValid, errors: validationErrors } = validateProductForm(formData, t);
    setErrors(validationErrors);
    return isValid;
  };

  /**
   * Build product data - wrapper using utility
   */
  const buildProductDataForSave = (status = 'draft') => {
    return buildProductData({
      formData,
      productType,
      selectedAttributeTerms,
      attributes,
      attributeTerms,
      status
    });
  };

  /**
   * Unified save handler - uses utilities and hooks
   */
  const handleSave = async (status = 'draft') => {
    if (!validateForm()) return;

    setSaving(true);
    try {
      const productData = buildProductDataForSave(status);

      let createdProductId = id;

      // Dynamically choose create or update based on edit mode
      if (isEditMode && id) {
        await productsAPI.update(id, productData);
        createdProductId = id;
      } else {
        const newProduct = await productsAPI.create(productData);
        createdProductId = newProduct.id;
      }

      // If there are pending variations, create them now
      if (pendingVariations.length > 0 && createdProductId && productType === 'variable') {
        try {
          // Small delay to ensure product is fully saved in WooCommerce
          await new Promise(resolve => setTimeout(resolve, 500));

          // Create all pending variations
          const variationPromises = pendingVariations.map(async (pendingVariation) => {
            const cleanedData = cleanVariationData(pendingVariation);
            return await variationsAPI.create(createdProductId, cleanedData);
          });

          await Promise.all(variationPromises);

          // Clear pending variations
          clearPendingVariations();

          // Reload variations to show them in the UI
          await loadVariations(createdProductId);
        } catch (variationError) {
          secureLog.error('Error creating variations', variationError);
          const errorMessage = variationError.response?.data?.message ||
            variationError.response?.data?.data?.message ||
            variationError.message ||
            t('failedToCreateVariations') ||
            'נכשל ביצירת וריאציות';

          setErrors(prev => ({
            ...prev,
            variations: errorMessage
          }));

          alert(t('error') + ': ' + errorMessage);
        }
      }

      // Show success modal
      setShowSuccessModal(true);
    } catch (error) {
      setErrors(prev => ({ ...prev, submit: error.message || t('saveFailed') }));
    } finally {
      setSaving(false);
    }
  };

  // All old inline functions have been replaced by hooks/utilities above

  return (
    <div className="min-h-screen bg-gray-50 p-3 sm:p-4 md:p-6" dir={isRTL ? 'rtl' : 'ltr'}>
      {/* Breadcrumbs */}
      <Breadcrumbs
        items={[
          t('dashboard'),
          t('ecommerce') || 'Ecommerce',
          isEditMode ? t('editProduct') : t('addProduct')
        ]}
      />

      {/* Title and Navigation */}
      <PageTitle
        title={isEditMode ? t('editProduct') : t('addProduct')}
        actions={
          <Button
            variant="ghost"
            onClick={() => navigate('/calculator')}
            className="flex items-center gap-2 text-gray-700 hover:text-primary-600 hover:bg-gray-100"
            icon={Calculator}
          >
            {t('calculator') || 'מחשבון'}
          </Button>
        }
      />

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 sm:gap-6">
        {/* Left Panel - Product Details */}
        <ProductDetailsPanel
          formData={formData}
          errors={errors}
          onFormDataChange={setFormData}
          productType={productType}
          onProductTypeChange={handleProductTypeChange}
          categories={categories}
          selectedDiscount={selectedDiscount}
          onDiscountSelect={handleDiscountSelect}
          onDiscountClear={handleDiscountClear}
          generatingSKU={generatingSKU}
          onGenerateSKU={handleGenerateSKU}
          improvingShortDescription={improvingShortDescription}
          onImproveShortDescription={handleImproveShortDescription}
          improvingDescription={improvingDescription}
          onImproveDescription={handleImproveDescription}
          onCalculatorClick={() => setShowCalculatorModal(true)}
          onScheduleClick={() => {
            setScheduleDates({
              start: formData.date_on_sale_from || '',
              end: formData.date_on_sale_to || ''
            });
            setShowScheduleModal(true);
          }}
          saving={saving}
        />

        {/* Right Panel - Media, Attributes, Variations */}
        <div className="space-y-6">
          {/* Upload Images */}
          <ProductImagesSection
            images={formData.images}
            uploading={uploadingImage}
            error={errors.images}
            onUpload={handleImageUpload}
            onRemove={removeImage}
            maxImages={12}
          />

          {/* Attributes Selection - Only show for variable products */}
          {productType === 'variable' && (
            <AttributesSection
              attributes={attributes}
              attributeTerms={attributeTerms}
              selectedAttributeIds={selectedAttributeIds}
              selectedAttributeTerms={selectedAttributeTerms}
              loading={loadingAttributes}
              onToggleAttribute={toggleAttribute}
              onToggleTerm={toggleAttributeTerm}
              isAttributeSelected={isAttributeSelected}
              isTermSelected={isTermSelected}
            />
          )}

          {/* Variations Section */}
          {productType === 'variable' && (
            <VariationsSection
              variations={variations}
              pendingVariations={pendingVariations}
              loading={loadingVariations}
              isEditMode={isEditMode && !!id}
              onAddClick={() => {
                setVariationFormData(prev => ({
                  ...prev,
                  regular_price: formData.regular_price || '',
                  sale_price: formData.sale_price || '',
                }));
                setShowCreateVariationModal(true);
              }}
              onVariationClick={handleEditVariation}
              onDeletePending={handleDeletePendingVariation}
              formatCurrency={formatCurrency}
              isRTL={isRTL}
              t={t}
            />
          )}

          {/* Calculator Modal */}
          {showCalculatorModal && (
            <CalculatorModal
              onClose={() => setShowCalculatorModal(false)}
              onSetPrice={(price) => {
                setFormData(prev => ({ ...prev, regular_price: price.toString() }));
                setShowCalculatorModal(false);
              }}
            />
          )}

          {/* Schedule Modal */}
          <ScheduleModal
            isOpen={showScheduleModal}
            onClose={() => setShowScheduleModal(false)}
            scheduleDates={scheduleDates}
            onDatesChange={setScheduleDates}
            onSave={() => {
              setFormData(prev => ({
                ...prev,
                date_on_sale_from: scheduleDates.start || '',
                date_on_sale_to: scheduleDates.end || ''
              }));
              setShowScheduleModal(false);
            }}
          />

          {/* Loading State */}
          {loadingProduct && (
            <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
              <p className="text-blue-800 text-sm text-right">{t('loading') || 'טוען...'}</p>
            </div>
          )}

          {/* Action Buttons */}
          <div className="flex flex-col gap-3">
            <Button
              variant="primary"
              onClick={() => handleSave('publish')}
              disabled={saving || loadingProduct}
              isLoading={saving}
              className="w-full"
              icon={isEditMode ? Save : Plus}
            >
              {isEditMode ? t('updateProduct') : t('addProduct')}
            </Button>
          </div>

          {errors.submit && (
            <div className="p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <p className="text-orange-800 text-sm text-right">{errors.submit}</p>
            </div>
          )}
        </div>
      </div>

      {/* Success Modal */}
      <SuccessModal
        isOpen={showSuccessModal}
        onClose={() => {
          setShowSuccessModal(false);
          navigate('/products');
        }}
        isEditMode={isEditMode}
        onConfirm={() => {
          setShowSuccessModal(false);
          navigate('/products');
        }}
      />

      {/* Edit Variation Modal */}
      <EditVariationModal
        isOpen={showEditVariationModal}
        onClose={() => setShowEditVariationModal(false)}
        formData={variationFormData}
        onFormDataChange={setVariationFormData}
        selectedAttributeIds={selectedAttributeIds}
        attributes={attributes}
        attributeTerms={attributeTerms}
        updating={creatingVariation}
        generatingSKU={generatingSKU}
        onGenerateSKU={async () => {
          try {
            setGeneratingSKU(true);
            const sku = await generateSKU(formData.name || '');
            setVariationFormData(prev => ({ ...prev, sku }));
          } catch (error) {
            // Failed to generate SKU
          } finally {
            setGeneratingSKU(false);
          }
        }}
        parentProductName={formData.name}
        onSubmit={handleUpdateVariation}
      />

      {/* Create Variation Modal */}
      <CreateVariationModal
        isOpen={showCreateVariationModal}
        onClose={() => setShowCreateVariationModal(false)}
        formData={variationFormData}
        onFormDataChange={setVariationFormData}
        selectedAttributeIds={selectedAttributeIds}
        attributes={attributes}
        attributeTerms={attributeTerms}
        creating={creatingVariation}
        generatingSKU={generatingSKU}
        onGenerateSKU={async () => {
          try {
            setGeneratingSKU(true);
            const sku = await generateSKU(formData.name || '');
            setVariationFormData(prev => ({ ...prev, sku }));
          } catch (error) {
            // Failed to generate SKU
          } finally {
            setGeneratingSKU(false);
          }
        }}
        parentProductName={formData.name}
        onSubmit={handleCreateVariation}
      />
    </div>
  );
};

export default AddProductView;
