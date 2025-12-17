import { useState, useEffect, useCallback } from 'react';
import { useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useQueryClient } from '@tanstack/react-query';
import { useLanguage } from '../../../../contexts/LanguageContext';
import { productsAPI, variationsAPI, attributesAPI } from '../../../../services/woocommerce';
import { generateSKU, improveText } from '../../../../services/gemini';
import { secureLog } from '../../../../utils/logger';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { productSchema } from '../../../../schemas/product';
import { useProductData, useAttributes, useVariations, useProductImages } from './';
import { buildProductData, buildVariationData, cleanVariationData } from '../utils/productBuilders';
import { generateCombinations } from '../utils/variationUtils';
import { productKeys } from '../../../../hooks/useProducts';

export const useAddProductViewModel = () => {
    // ViewModel responsible for AddProductView logic
    const { t, isRTL, formatCurrency } = useLanguage();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const queryClient = useQueryClient();

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
    const [createdProductId, setCreatedProductId] = useState(null);
    // Note: The 'saving' state variable is already destructured from useForm's formState.isSubmitting.
    // Adding a new local state variable named 'saving' would cause a conflict or redundancy.
    // Assuming the instruction intended to use the 'saving' from formState, or rename it if a separate state was needed.
    // For now, we will not add `const [saving, setSaving] = useState(false);` to avoid conflict.

    // React Hook Form
    const methods = useForm({
        resolver: zodResolver(productSchema),
        defaultValues: {
            product_name: '', // Form uses 'product_name' not 'name' (see schema)
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
            // Shipping and tax fields removed from UI but kept as defaults for WooCommerce API
            requires_shipping: false,
            weight: '',
            dimensions: { length: '', width: '', height: '' },
            shipping_class: '',
            tax_status: 'taxable',
            tax_class: '',
            date_on_sale_from: '',
            date_on_sale_to: ''
        },
        mode: 'onTouched',
        reValidateMode: 'onChange'
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
        setCreatedProductId(null);
    }, []);

    // Handler to create another product - clears the form
    const handleCreateAnotherProduct = useCallback(() => {
        setShowSuccessModal(false);
        setCreatedProductId(null);

        // Only reset form if we're in create mode (not edit mode)
        if (!isEditMode) {
            // Reset form to initial state with explicit default values
            // Note: Form uses 'product_name' not 'name' (see schema)
            reset({
                product_name: '',
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
                tax_class: '',
                date_on_sale_from: '',
                date_on_sale_to: ''
            });

            // Clear variations
            clearVariations();
            clearPendingVariations();
            clearDeletedVariations();

            // Clear selected attributes
            setSelectedAttributeIds([]);
            setSelectedAttributeTerms({});

            // Reset product type to simple
            setProductType('simple');

            // Reset additional UI state
            setSelectedDiscount('');
            setScheduleDates({
                start: '',
                end: ''
            });
            setShowCalculatorModal(false);
            setShowScheduleModal(false);

            // Reset variation form data
            resetVariationForm();

            // Clear any form errors
            methods.clearErrors();
        }
    }, [isEditMode, reset, clearVariations, clearPendingVariations, setSelectedAttributeIds, setSelectedAttributeTerms, setProductType, setSelectedDiscount, setScheduleDates, setShowCalculatorModal, setShowScheduleModal, resetVariationForm, methods]);

    // Handler to go to products page with the created product
    const handleGoToProducts = useCallback(async () => {
        setShowSuccessModal(false);

        // Invalidate all products queries to ensure the new product appears in the list
        // This will trigger a refetch when the Products component mounts
        queryClient.invalidateQueries({ queryKey: productKeys.all });

        if (createdProductId) {
            navigate(`/products?view=${createdProductId}`);
        } else {
            navigate('/products');
        }
    }, [createdProductId, navigate, queryClient]);

    // Schedule click handler - currently unused but kept for future implementation
    const handleScheduleClick = useCallback(() => {
        // Future: Open schedule modal for sale dates
    }, []);

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
            parentSku: formData.sku || '',
            existingVariationSkus: [
                ...variations.map(v => v.sku).filter(Boolean),
                ...pendingVariations.map(v => v.sku).filter(Boolean)
            ],
            t
        });
    }, [createVariation, isEditMode, id, formData, attributes, attributeTerms, variations, pendingVariations, t]);

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

        // Format prices properly - only use regular_price, not price field
        const formatPriceForForm = (priceValue) => {
            if (!priceValue) return '';
            const numPrice = parseFloat(priceValue);
            if (isNaN(numPrice)) return '';
            return numPrice.toFixed(2);
        };

        setVariationFormData({
            attributes: attributesMap,
            // Only use regular_price, ignore price field (may include tax)
            regular_price: formatPriceForForm(variation.regular_price),
            sale_price: formatPriceForForm(variation.sale_price),
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
            parentSku: formData.sku || '',
            existingVariationSkus: [
                ...variations
                    .filter(v => v.id !== editingVariationId)
                    .map(v => v.sku)
                    .filter(Boolean),
                ...pendingVariations
                    .filter(v => v.id !== editingVariationId)
                    .map(v => v.sku)
                    .filter(Boolean)
            ],
            t
        });
    }, [updateVariation, id, editingVariationId, formData, attributes, attributeTerms, variations, pendingVariations, t]);

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
            const generatedSKU = await generateSKU(formData.product_name || '');
            setFormData(prev => ({ ...prev, sku: generatedSKU }));
        } catch (error) {
            const fallbackSKU = `PRD-${Date.now().toString(36).toUpperCase().substring(7)}-${Math.random().toString(36).substring(2, 6).toUpperCase()}`;
            setFormData(prev => ({ ...prev, sku: fallbackSKU }));
        } finally {
            setGeneratingSKU(false);
        }
    }, [formData.product_name, setFormData]);

    // Handler for generating SKU for variations (extracted to avoid duplication)
    const handleGenerateVariationSKU = useCallback(async () => {
        setGeneratingSKU(true);
        try {
            const generatedSKU = await generateSKU(formData.product_name || '');
            setVariationFormData(prev => ({ ...prev, sku: generatedSKU }));
        } catch (error) {
            secureLog.error('Error generating variation SKU', error);
        } finally {
            setGeneratingSKU(false);
        }
    }, [formData.product_name, setVariationFormData]);

    const handleImproveShortDescription = useCallback(async () => {
        if (!formData.short_description?.trim()) return;
        setImprovingShortDescription(true);
        try {
            const improved = await improveText(formData.short_description, 'short_description', formData.product_name || '');
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
    }, [formData.short_description, formData.product_name, setFormData]);

    const handleImproveDescription = useCallback(async () => {
        if (!formData.description?.trim()) return;
        setImprovingDescription(true);
        try {
            const improved = await improveText(formData.description, 'description', formData.product_name || '');
            const cleaned = improved
                .replace(/<[^>]*>/g, '')
                .replace(/&[a-zA-Z0-9#]+;/g, ' ')
                .replace(/\s+/g, ' ')
                .trim();
            setFormData(prev => ({ ...prev, description: cleaned }));
        } catch (error) {
            secureLog.error('Error improving description', error);
        } finally {
            setImprovingDescription(false);
        }
    }, [formData.description, formData.product_name, setFormData]);

    const handleGenerateVariations = useCallback(async () => {
        // Validate at least one attribute is selected with terms
        const hasSelection = Object.values(selectedAttributeTerms).some(terms => terms && terms.length > 0);
        if (!hasSelection) {
            alert(t('selectAttributesToGenerate') || 'אנא בחר תכונות וערכים כדי לייצר וריאציות');
            return;
        }

        const combinations = generateCombinations(attributes, selectedAttributeTerms, attributeTerms);

        if (combinations.length === 0) {
            return;
        }

        const newVariations = [];
        // Current variations (saved + pending) used for checking duplicates
        const currentVariations = [...variations, ...pendingVariations];

        // Helper to normalize attributes for comparison
        const normalizeAttributes = (attrs) => {
            if (!attrs) return '';
            // If attrs is an array (from API or buildVariationData)
            if (Array.isArray(attrs)) {
                return attrs.map(attr => `${attr.id}:${attr.option_id || attr.option}`).sort().join('|');
            }
            // If attrs is an object (from combo.attributes)
            if (typeof attrs === 'object') {
                return Object.entries(attrs).map(([attrId, termId]) => `${attrId}:${termId}`).sort().join('|');
            }
            return '';
        };

        for (const combo of combinations) {
            const normalizedComboAttrs = normalizeAttributes(combo.attributes);

            // Check for duplicates based on normalized attributes
            const isDuplicate = currentVariations.some(existing => {
                const normalizedExistingAttrs = normalizeAttributes(existing.attributes);
                return normalizedComboAttrs === normalizedExistingAttrs;
            });

            if (!isDuplicate) {
                const variationFormDataMock = {
                    attributes: combo.attributes,
                    regular_price: formData.regular_price || '',
                    sale_price: formData.sale_price || '',
                    sku: '', // Will be generated or left empty
                    stock_quantity: formData.stock_quantity || '',
                    image: null
                };

                // Build the data structure expected by pending list and API
                const builtVariation = {
                    ...buildVariationData({
                        variationFormData: variationFormDataMock,
                        attributes,
                        attributeTerms,
                        isNew: true // Indicate it's a new variation being built
                    }),
                    id: `temp-gen-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
                };
                newVariations.push(builtVariation);
            }
        }

        if (newVariations.length > 0) {
            setPendingVariations(prev => [...prev, ...newVariations]);
        }
    }, [attributes, selectedAttributeTerms, attributeTerms, variations, pendingVariations, formData, t, setPendingVariations]);



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

            // Store the created product ID for navigation
            setCreatedProductId(createdProductId);

            // Handle variations for both create and update modes
            if (productType === 'variable' && createdProductId) {
                try {
                    // Wait a bit for product to be fully saved
                    await new Promise(resolve => setTimeout(resolve, 500));

                    const variationOperations = [];

                    // 1. Delete removed variations (edit mode only)
                    if (isEditMode && deletedVariationIds.length > 0) {
                        const deletePromises = deletedVariationIds.map(variationId =>
                            variationsAPI.delete(createdProductId, variationId).catch(err => {
                                secureLog.error(`Error deleting variation ${variationId}`, err);
                                throw err;
                            })
                        );
                        variationOperations.push(...deletePromises);
                    }

                    // 2. Create new pending variations (both create and update modes)
                    if (pendingVariations.length > 0) {
                        const createPromises = pendingVariations.map(async (pendingVariation) => {
                            const cleanedData = cleanVariationData(pendingVariation);
                            return variationsAPI.create(createdProductId, cleanedData);
                        });
                        variationOperations.push(...createPromises);
                    }

                    // Execute all variation operations in parallel
                    if (variationOperations.length > 0) {
                        await Promise.all(variationOperations);
                    }

                    // Clear pending and deleted variations
                    clearPendingVariations();
                    clearDeletedVariations();

                    // FORCE SYNC: Touch the parent product to trigger WooCommerce price recalculation
                    // This ensures the parent's 'price' and 'price_html' fields are updated based on the new variations
                    try {
                        await productsAPI.update(createdProductId, { status });
                    } catch (syncError) {
                        secureLog.warn('Failed to force sync parent product price', syncError);
                        // Continue anyway, as this is just a sync optimization
                    }

                    // Reload variations to get latest state
                    await loadVariations(createdProductId);
                } catch (variationError) {
                    secureLog.error('Error managing variations', variationError);
                    secureLog.error('Error response', variationError.response?.data);
                    const errorMessage = variationError.response?.data?.message ||
                        variationError.response?.data?.data?.message ||
                        variationError.message ||
                        t('failedToManageVariations') ||
                        'נכשל בניהול וריאציות';

                    // Set error on form
                    methods.setError('root', {
                        type: 'manual',
                        message: errorMessage
                    });
                    return; // Don't proceed if variation operations failed
                }
            }

            // For update mode: redirect directly to products page
            if (isEditMode) {
                // Invalidate queries and navigate to products page with updated product
                queryClient.invalidateQueries({ queryKey: productKeys.all });
                navigate(`/products?view=${createdProductId}`);
            } else {
                // For create mode: show success modal
                setShowSuccessModal(true);
            }
        } catch (error) {
            secureLog.error('Submit Error', error);

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
    }, [id, isEditMode, productType, pendingVariations, deletedVariationIds, t, clearPendingVariations, clearDeletedVariations, loadVariations, selectedAttributeTerms, attributes, attributeTerms, methods]);

    const handleSave = useCallback(async (status = 'draft') => {
        console.log('handleSave called with status:', status);
        // Update status in form first so validation runs against the correct status
        setValue('status', status);

        // Wait for state update/render cycle if needed, but synchronous setValue should work with RHF
        // Trigger validation and submit
        return handleSubmit(
            (data) => {
                console.log('Form validation passed. submitting...', data);
                return onSubmit(data, status);
            },
            (errors) => {
                console.error('Form validation failed:', errors);
                // Optionally show a general toast here if needed
            }
        )();
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
        showSuccessModal, setShowSuccessModal, handleSuccessModalClose, handleCreateAnotherProduct, handleGoToProducts, createdProductId,
        formData, errors, saving, submitError, setFormData, updateField,
        attributes, attributeTerms, selectedAttributeIds, selectedAttributeTerms, loadingAttributes, originalProductAttributes, setAttributes, setAttributeTerms, setSelectedAttributeIds, setSelectedAttributeTerms, setOriginalProductAttributes, loadAttributes, loadAttributeTerms, toggleAttribute, toggleAttributeTerm, isAttributeSelected, isTermSelected, clearAttributes, resetAttributes, attributeErrors,
        variations, pendingVariations, deletedVariationIds, loadingVariations, showCreateVariationModal, showEditVariationModal, editingVariationId, creatingVariation, variationFormData, setVariations, setPendingVariations, setShowCreateVariationModal, setShowEditVariationModal, setEditingVariationId, setVariationFormData, loadVariations, resetVariationForm, handleDeletePendingVariation, handleDeleteVariation, clearDeletedVariations, createVariation, updateVariation, clearPendingVariations, clearVariations,
        uploadingImage, handleImageUpload, removeImage,
        categories, loadingProduct, loadProduct,
        handleCreateVariation, handleEditVariation, handleUpdateVariation, handleProductTypeChange, handleGenerateVariations,
        handleDiscountSelect, handleDiscountClear, handleGenerateSKU, handleGenerateVariationSKU, handleImproveShortDescription, handleImproveDescription,
        handleSave,
        methods // Expose RHF methods to the view
    };
};
