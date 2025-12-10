import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { productsAPI, variationsAPI, attributesAPI } from '../../../../services/woocommerce';
import { generateSKU, improveText } from '../../../../services/gemini';
import { secureLog } from '../../../../utils/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../../../schemas/product';
import { useProductData, useAttributes, useVariations, useProductImages } from './';
import { buildProductData, cleanVariationData } from '../utils/productBuilders';

export const useAddProductViewModel = () => {
    // ViewModel responsible for AddProductView logic
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
    // Note: The 'saving' state variable is already destructured from useForm's formState.isSubmitting.
    // Adding a new local state variable named 'saving' would cause a conflict or redundancy.
    // Assuming the instruction intended to use the 'saving' from formState, or rename it if a separate state was needed.
    // For now, we will not add `const [saving, setSaving] = useState(false);` to avoid conflict.

    // React Hook Form
    const methods = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            name: '',
            status: 'draft',
            type: 'simple',
            description: '',
            short_description: '',
            regular_price: '',
            sale_price: '',
            sku: '',
            manage_stock: true,
            stock_quantity: '',
            stock_status: 'instock',
            categories: [],
            images: [],
            attributes: [],
            tags: [],
            requires_shipping: false,
            weight: '',
            dimensions: { length: '', width: '', height: '' },
            shipping_class: '',
            tax_status: 'taxable',
            tax_class: ''
        },
        mode: 'onChange'
    });

    const {
        register,
        control,
        handleSubmit,
        setValue,
        getValues,
        watch,
        reset,
        formState: { errors: formErrors, isSubmitting: saving }
    } = methods;

    // Watch all fields to keep UI in sync (mimic old formData behavior)
    const formData = watch();
    const errors = formErrors; // Map to existing errors variable name to minimize refactor

    // Get submit error from form state for toast display
    const submitError = formErrors.root?.message;

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
        resetAttributes,
        attributeErrors
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
        resetForm: reset,
        setValue,
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
        if (productType === 'variable' && !loadingAttributes && attributes.length === 0) {
            loadAttributes(productType);
        }
    }, [productType, loadingAttributes, attributes.length, loadAttributes]);

    // Helper compatibility functions
    const updateField = useCallback((field, value) => {
        setValue(field, value, { shouldValidate: true, shouldDirty: true });
    }, [setValue]);

    const setFormData = useCallback((newData) => {
        if (typeof newData === 'function') {
            const current = getValues();
            const updated = newData(current);
            reset(updated);
        } else {
            reset(newData);
        }
    }, [reset, getValues]);

    // Handler for success modal close - resets form for creating another product
    const handleSuccessModalClose = useCallback(() => {
        setShowSuccessModal(false);

        // Only reset form if we're in create mode (not edit mode)
        if (!isEditMode) {
            // Reset form to initial state
            reset();
            // Clear variations
            clearVariations();
            clearPendingVariations();
            // Clear selected attributes
            setSelectedAttributeIds([]);
            setSelectedAttributeTerms({});
            // Note: Images are managed by useProductImages hook and will reset with form
        }
    }, [isEditMode, reset, clearVariations, clearPendingVariations, setSelectedAttributeIds, setSelectedAttributeTerms]);

    const handleScheduleClick = useCallback(() => { }, [productType]);

    // Handlers

    const handleImageUpload = useCallback(async (fileList) => {
        const result = await handleImageUploadBase(fileList, formData.images || [], (updatedImages) => {
            updateField('images', updatedImages);
            methods.clearErrors('images');
        });

        if (!result.success && result.error) {
            methods.setError('images', {
                type: 'manual',
                message: result.error
            });
        }
    }, [handleImageUploadBase, formData.images, updateField, methods]);

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

    const onSubmit = useCallback(async (data, status = 'draft') => {
        // Map product_name back to name for API compatibility
        const mappedData = {
            ...data,
            name: data.product_name, // Map frontend field to backend field
            status
        };
        delete mappedData.product_name; // Remove frontend-only field



        try {
            const productData = buildProductData({
                formData: mappedData,
                productType,
                selectedAttributeTerms,
                attributes,
                attributeTerms,
                status
            });



            let createdProductId = id;

            if (isEditMode && id) {
                await productsAPI.update(id, productData);
                createdProductId = id;
            } else {
                const newProduct = await productsAPI.create(productData);

                // Handle both response formats: { id: 123 } or { data: { id: 123 } }
                createdProductId = newProduct.data?.id || newProduct.id;

            }


            if (pendingVariations.length > 0 && createdProductId && productType === 'variable') {


                try {
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const variationPromises = pendingVariations.map(async (pendingVariation, index) => {
                        const cleanedData = cleanVariationData(pendingVariation);
                        const result = await variationsAPI.create(createdProductId, cleanedData);
                        return result;
                    });

                    await Promise.all(variationPromises);


                    clearPendingVariations();
                    await loadVariations(createdProductId);
                } catch (variationError) {
                    console.error('❌ Error creating variations:', variationError);
                    console.error('❌ Error response:', variationError.response?.data);
                    secureLog.error('Error creating variations', variationError);
                    const errorMessage = variationError.response?.data?.message ||
                        variationError.response?.data?.data?.message ||
                        variationError.message ||
                        t('failedToCreateVariations') ||
                        'נכשל ביצירת וריאציות';

                    // Manually set error on variations field if possible, or alert
                    alert(t('error') + ': ' + errorMessage);
                }
            } else {

            }



            setShowSuccessModal(true);
        } catch (error) {
            console.error('Submit Error', error);

            // Extract detailed error message
            let errorMessage = t('failedToSaveProduct') || 'שגיאה בשמירת המוצר';

            if (error.response?.data) {
                const errorData = error.response.data;
                // Handle specific error cases
                if (errorData.code === 'product_invalid_sku') {
                    errorMessage = t('skuAlreadyExists') || 'מק"ט זה כבר קיים במערכת. אנא השתמש במק"ט אחר.';
                } else if (errorData.code === 'woocommerce_rest_product_invalid_id') {
                    errorMessage = t('productNotFound') || 'המוצר לא נמצא';
                } else if (errorData.data?.params) {
                    // Validation errors with field details
                    const params = errorData.data.params;
                    const fieldErrors = Object.keys(params).map(field => {
                        const fieldName = field === 'name' ? (t('productName') || 'שם מוצר') :
                            field === 'regular_price' ? (t('regularPrice') || 'מחיר רגיל') :
                                field === 'sku' ? (t('sku') || 'מק"ט') :
                                    field === 'stock_quantity' ? (t('stockQuantity') || 'כמות במלאי') :
                                        field;
                        return `${fieldName}: ${params[field]}`;
                    });
                    errorMessage = fieldErrors.join('\n');
                }

                // Backend validation errors
                if (errorData.errors && Array.isArray(errorData.errors)) {
                    const validationErrors = errorData.errors.map(err => {
                        if (err.path && err.message) {
                            const fieldName = err.path[0] === 'product_name' ? (t('productName') || 'שם מוצר') :
                                err.path[0] === 'regular_price' ? (t('regularPrice') || 'מחיר רגיל') :
                                    err.path[0] === 'sku' ? (t('sku') || 'מק"ט') :
                                        err.path[0] === 'stock_quantity' ? (t('stockQuantity') || 'כמות במלאי') :
                                            err.path[0];
                            return `${fieldName}: ${err.message}`;
                        }
                        return err.message || JSON.stringify(err);
                    });
                    errorMessage = validationErrors.join('\n');
                }
            }

            // Set form error with detailed message
            methods.setError('root', {
                type: 'manual',
                message: errorMessage
            });
        }
    }, [id, isEditMode, productType, pendingVariations, t, clearPendingVariations, loadVariations, selectedAttributeTerms, attributes, attributeTerms, methods]);

    const handleSave = useCallback(async (status = 'draft') => {
        // Update status in form first so validation runs against the correct status
        setValue('status', status);

        // Wait for state update/render cycle if needed, but synchronous setValue should work with RHF
        // Trigger validation and submit
        return handleSubmit((data) => onSubmit(data, status))();
    }, [handleSubmit, onSubmit, setValue]);

    return {
        t, isRTL, formatCurrency, navigate, id, isEditMode,
        showScheduleModal, setShowScheduleModal, scheduleDates, setScheduleDates,
        showCalculatorModal, setShowCalculatorModal,
        selectedDiscount, setSelectedDiscount,
        productType, setProductType,
        generatingSKU, setGeneratingSKU,
        improvingShortDescription, setImprovingShortDescription,
        improvingDescription, setImprovingDescription,
        showSuccessModal, setShowSuccessModal, handleSuccessModalClose,
        formData, errors, saving, submitError, setFormData, updateField,
        attributes, attributeTerms, selectedAttributeIds, selectedAttributeTerms, loadingAttributes, originalProductAttributes, setAttributes, setAttributeTerms, setSelectedAttributeIds, setSelectedAttributeTerms, setOriginalProductAttributes, loadAttributes, loadAttributeTerms, toggleAttribute, toggleAttributeTerm, isAttributeSelected, isTermSelected, clearAttributes, resetAttributes, attributeErrors,
        variations, pendingVariations, loadingVariations, showCreateVariationModal, showEditVariationModal, editingVariationId, creatingVariation, variationFormData, setVariations, setPendingVariations, setShowCreateVariationModal, setShowEditVariationModal, setEditingVariationId, setVariationFormData, loadVariations, resetVariationForm, handleDeletePendingVariation, createVariation, updateVariation, clearPendingVariations, clearVariations,
        uploadingImage, handleImageUpload, removeImage,
        categories, loadingProduct, loadProduct,
        handleCreateVariation, handleEditVariation, handleUpdateVariation, handleProductTypeChange,
        handleDiscountSelect, handleDiscountClear, handleGenerateSKU, handleImproveShortDescription, handleImproveDescription,
        handleSave,
        methods // Expose RHF methods to the view
    };
};
