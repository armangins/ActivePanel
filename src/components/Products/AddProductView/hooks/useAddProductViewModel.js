import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { productsAPI, variationsAPI, attributesAPI } from '../../../../services/woocommerce';
import { generateSKU, improveText } from '../../../../services/gemini';
import { secureLog } from '../../../../utils/logger';
import { useProductForm, useProductData, useAttributes, useVariations, useProductImages } from './';
import { validateProductForm, buildProductData, cleanVariationData, mapProductAttributesToTerms } from '../utils';

export const useAddProductViewModel = () => {
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

    // Handlers

    const handleImageUpload = useCallback(async (fileList) => {
        const result = await handleImageUploadBase(fileList, formData.images || [], (updatedImages) => {
            updateField('images', updatedImages);
            clearErrors();
        });

        if (!result.success && result.error) {
            setErrors(prev => ({ ...prev, images: result.error }));
        }
    }, [handleImageUploadBase, formData.images, updateField, clearErrors, setErrors]);

    const removeImage = useCallback((imageId) => {
        removeImageBase(imageId, formData.images || [], (updatedImages) => {
            updateField('images', updatedImages);
        });
    }, [removeImageBase, formData.images, updateField]);

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

    const handleProductTypeChange = useCallback(async (newType) => {
        if (productType === newType) return;
        if (saving) return;

        const previousType = productType;
        setProductType(newType);

        try {
            if (newType === 'simple') {
                clearVariations();
                clearAttributes();
            } else if (newType === 'variable') {
                await loadAttributes(newType);

                if (isEditMode && id && originalProductAttributes.length > 0) {
                    const selectedIds = originalProductAttributes.map(attr => attr.id);
                    setSelectedAttributeIds(selectedIds);

                    const termsMap = await mapProductAttributesToTerms(
                        originalProductAttributes,
                        async (attributeId) => {
                            await loadAttributeTerms(attributeId);
                            return await attributesAPI.getTerms(attributeId);
                        }
                    );
                    setSelectedAttributeTerms(termsMap);
                }

                if (isEditMode && id) {
                    loadVariations(id);
                } else {
                    setVariations([]);
                }
            }
        } catch (error) {
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

    const validateForm = useCallback(() => {
        const { isValid, errors: validationErrors } = validateProductForm(formData, t);
        setErrors(validationErrors);
        return isValid;
    }, [formData, t, setErrors]);

    const buildProductDataForSave = useCallback((status = 'draft') => {
        return buildProductData({
            formData,
            productType,
            selectedAttributeTerms,
            attributes,
            attributeTerms,
            status
        });
    }, [formData, productType, selectedAttributeTerms, attributes, attributeTerms]);

    const handleSave = useCallback(async (status = 'draft') => {
        if (!validateForm()) return;

        setSaving(true);
        try {
            const productData = buildProductDataForSave(status);

            let createdProductId = id;

            if (isEditMode && id) {
                await productsAPI.update(id, productData);
                createdProductId = id;
            } else {
                const newProduct = await productsAPI.create(productData);
                createdProductId = newProduct.id;
            }

            if (pendingVariations.length > 0 && createdProductId && productType === 'variable') {
                try {
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const variationPromises = pendingVariations.map(async (pendingVariation) => {
                        const cleanedData = cleanVariationData(pendingVariation);
                        return await variationsAPI.create(createdProductId, cleanedData);
                    });

                    await Promise.all(variationPromises);

                    clearPendingVariations();
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

            setShowSuccessModal(true);
        } catch (error) {
            setErrors(prev => ({ ...prev, submit: error.message || t('saveFailed') }));
        } finally {
            setSaving(false);
        }
    }, [validateForm, buildProductDataForSave, id, isEditMode, productType, pendingVariations, t, setSaving, setErrors, clearPendingVariations, loadVariations]);

    return {
        t, isRTL, formatCurrency, navigate, id, isEditMode,
        showScheduleModal, setShowScheduleModal, scheduleDates, setScheduleDates,
        showCalculatorModal, setShowCalculatorModal,
        selectedDiscount, setSelectedDiscount,
        productType, setProductType,
        generatingSKU, setGeneratingSKU,
        improvingShortDescription, setImprovingShortDescription,
        improvingDescription, setImprovingDescription,
        showSuccessModal, setShowSuccessModal,
        formData, errors, saving, setFormData, updateFormData, updateField, setErrors, clearErrors, setSaving,
        attributes, attributeTerms, selectedAttributeIds, selectedAttributeTerms, loadingAttributes, originalProductAttributes, setAttributes, setAttributeTerms, setSelectedAttributeIds, setSelectedAttributeTerms, setOriginalProductAttributes, loadAttributes, loadAttributeTerms, toggleAttribute, toggleAttributeTerm, isAttributeSelected, isTermSelected, clearAttributes, resetAttributes,
        variations, pendingVariations, loadingVariations, showCreateVariationModal, showEditVariationModal, editingVariationId, creatingVariation, variationFormData, setVariations, setPendingVariations, setShowCreateVariationModal, setShowEditVariationModal, setEditingVariationId, setVariationFormData, loadVariations, resetVariationForm, handleDeletePendingVariation, createVariation, updateVariation, clearPendingVariations, clearVariations,
        uploadingImage, handleImageUpload, removeImage,
        categories, loadingProduct, loadProduct,
        handleCreateVariation, handleEditVariation, handleUpdateVariation, handleProductTypeChange,
        handleDiscountSelect, handleDiscountClear, handleGenerateSKU, handleImproveShortDescription, handleImproveDescription,
        handleSave
    };
};
