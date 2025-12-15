import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TagOutlined as Tag, UserOutlined as Users, InboxOutlined as Package } from '@ant-design/icons';
import { couponsAPI, productsAPI, categoriesAPI } from '../../../services/woocommerce';
import { couponSchema } from '../../../schemas/coupon';
import { secureLog } from '../../../utils/logger';
import { useCreateCoupon, useUpdateCoupon } from '../../../hooks/useCoupons';

const useCouponModal = (coupon, onClose, onSave, t) => {
    // Use React Query mutations for automatic cache invalidation
    const createCouponMutation = useCreateCoupon();
    const updateCouponMutation = useUpdateCoupon();
    
    const [currentStep, setCurrentStep] = useState(0);
    const [formData, setFormData] = useState({
        code: coupon?.code || '',
        discount_type: coupon?.discount_type || 'percent',
        amount: coupon?.amount || '',
        description: coupon?.description || '',
        free_shipping: coupon?.free_shipping || false,
        date_expires: coupon?.date_expires ? coupon.date_expires.split('T')[0] : '',
        minimum_amount: coupon?.minimum_amount || '',
        maximum_amount: coupon?.maximum_amount || '',
        individual_use: coupon?.individual_use || false,
        exclude_sale_items: coupon?.exclude_sale_items || false,
        product_ids: coupon?.product_ids || [],
        exclude_product_ids: coupon?.exclude_product_ids || [],
        product_categories: coupon?.product_categories || [],
        exclude_product_categories: coupon?.exclude_product_categories || [],
        email_restrictions: coupon?.email_restrictions || [],
        usage_limit: coupon?.usage_limit || '',
        usage_limit_per_user: coupon?.usage_limit_per_user || '',
    });

    // Use TanStack Query for caching instead of localStorage
    const { data: productsData, isLoading: productsLoading } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: async () => {
            // Fetch products with images for thumbnails
            const result = await productsAPI.list({ per_page: 100 });
            return result?.data || [];
        },
        staleTime: 60 * 60 * 1000, // 1 hour cache
    });
    
    const allProducts = productsData || [];

    const { data: allCategories = [], isLoading: categoriesLoading } = useQuery({
        queryKey: ['categories', 'all'],
        queryFn: () => categoriesAPI.getAll(),
        staleTime: 60 * 60 * 1000, // 1 hour cache
    });

    const loading = productsLoading || categoriesLoading;
    const [saving, setSaving] = useState(false);
    const [validationErrors, setValidationErrors] = useState({});
    const [emailInput, setEmailInput] = useState('');
    const [productSearch, setProductSearch] = useState('');
    const [excludeProductSearch, setExcludeProductSearch] = useState('');
    const [categorySearch, setCategorySearch] = useState('');
    const [showProductDropdown, setShowProductDropdown] = useState(false);
    const [showExcludeProductDropdown, setShowExcludeProductDropdown] = useState(false);
    const [tempSelectedProducts, setTempSelectedProducts] = useState([]);
    const [tempSelectedExcludeProducts, setTempSelectedExcludeProducts] = useState([]);

    const steps = [
        { id: 0, label: t('generalSettings') || 'General Settings', icon: Tag },
        { id: 1, label: t('usageRestrictions') || 'Usage Restrictions', icon: Package },
        { id: 2, label: t('usageLimits') || 'Usage Limits', icon: Users },
    ];

    useEffect(() => {
        if (coupon) {
            setFormData({
                code: coupon.code || '',
                discount_type: coupon.discount_type || 'percent',
                amount: coupon.amount || '',
                description: coupon.description || '',
                free_shipping: coupon.free_shipping || false,
                date_expires: coupon.date_expires ? coupon.date_expires.split('T')[0] : '',
                minimum_amount: coupon.minimum_amount || '',
                maximum_amount: coupon.maximum_amount || '',
                individual_use: coupon.individual_use || false,
                exclude_sale_items: coupon.exclude_sale_items || false,
                product_ids: coupon.product_ids || [],
                exclude_product_ids: coupon.exclude_product_ids || [],
                product_categories: coupon.product_categories || [],
                exclude_product_categories: coupon.exclude_product_categories || [],
                email_restrictions: coupon.email_restrictions || [],
                usage_limit: coupon.usage_limit || '',
                usage_limit_per_user: coupon.usage_limit_per_user || '',
            });
        }
    }, [coupon]);

    const filteredProducts = useMemo(() => {
        // Ensure allProducts is an array
        const products = Array.isArray(allProducts) ? allProducts : [];
        if (!productSearch) return [];
        const query = productSearch.toLowerCase();
        return products.filter(p =>
            p?.name?.toLowerCase().includes(query) ||
            p?.sku?.toLowerCase().includes(query)
        ).slice(0, 20); // Limit to 20 for dropdown
    }, [allProducts, productSearch]);

    const filteredExcludeProducts = useMemo(() => {
        // Ensure allProducts is an array
        const products = Array.isArray(allProducts) ? allProducts : [];
        if (!excludeProductSearch) return [];
        const query = excludeProductSearch.toLowerCase();
        return products.filter(p =>
            p?.name?.toLowerCase().includes(query) ||
            p?.sku?.toLowerCase().includes(query)
        ).slice(0, 20); // Limit to 20 for dropdown
    }, [allProducts, excludeProductSearch]);

    const filteredCategories = useMemo(() => {
        // Ensure allCategories is an array
        const categories = Array.isArray(allCategories) ? allCategories : [];
        if (!categorySearch) return categories;
        const query = categorySearch.toLowerCase();
        return categories.filter(c =>
            c?.name?.toLowerCase().includes(query)
        );
    }, [allCategories, categorySearch]);

    const validateStep = (step) => {
        let result;
        const currentData = { ...formData };

        if (step === 0) {
            // General Settings - validate required fields
            result = couponSchema.pick({ code: true, amount: true, discount_type: true }).safeParse(currentData);
        } else if (step === 1) {
            // Usage Restrictions - all fields are optional
            // Validate the structure of numeric fields if they're provided
            const errors = {};
            
            // Validate minimum_amount if provided
            const minAmountStr = String(currentData.minimum_amount || '').trim();
            if (minAmountStr !== '') {
                const minAmount = parseFloat(minAmountStr);
                if (isNaN(minAmount) || minAmount < 0) {
                    errors.minimum_amount = t('invalidAmount') || 'Invalid minimum amount';
                }
            }
            
            // Validate maximum_amount if provided
            const maxAmountStr = String(currentData.maximum_amount || '').trim();
            if (maxAmountStr !== '') {
                const maxAmount = parseFloat(maxAmountStr);
                if (isNaN(maxAmount) || maxAmount < 0) {
                    errors.maximum_amount = t('invalidAmount') || 'Invalid maximum amount';
                }
            }
            
            // Validate that maximum is greater than minimum if both are provided
            if (minAmountStr !== '' && maxAmountStr !== '') {
                const minAmount = parseFloat(minAmountStr);
                const maxAmount = parseFloat(maxAmountStr);
                if (!isNaN(minAmount) && !isNaN(maxAmount) && maxAmount < minAmount) {
                    errors.maximum_amount = t('maximumMustBeGreaterThanMinimum') || 'Maximum amount must be greater than minimum amount';
                }
            }
            
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                return false;
            }
            
            setValidationErrors({});
            return true;
        } else if (step === 2) {
            // Usage Limits - all fields are optional
            // Validate the structure of numeric fields if they're provided
            const errors = {};
            
            // Validate usage_limit if provided
            const usageLimitStr = String(currentData.usage_limit || '').trim();
            if (usageLimitStr !== '') {
                const usageLimit = parseInt(usageLimitStr, 10);
                if (isNaN(usageLimit) || usageLimit < 0 || !isFinite(usageLimit)) {
                    errors.usage_limit = t('invalidUsageLimit') || 'Invalid usage limit';
                }
            }
            
            // Validate usage_limit_per_user if provided
            const usageLimitPerUserStr = String(currentData.usage_limit_per_user || '').trim();
            if (usageLimitPerUserStr !== '') {
                const usageLimitPerUser = parseInt(usageLimitPerUserStr, 10);
                if (isNaN(usageLimitPerUser) || usageLimitPerUser < 0 || !isFinite(usageLimitPerUser)) {
                    errors.usage_limit_per_user = t('invalidUsageLimitPerUser') || 'Invalid usage limit per user';
                }
            }
            
            if (Object.keys(errors).length > 0) {
                setValidationErrors(errors);
                return false;
            }
            
            setValidationErrors({});
            return true;
        }

        if (result && !result.success) {
            const errors = {};
            result.error.issues.forEach((issue) => {
                const path = issue.path[0];
                if (path) {
                    errors[path] = issue.message;
                }
            });
            setValidationErrors(errors);
            return false;
        }

        setValidationErrors({});
        return true;
    };

    const handleNext = () => {
        // Validate current step before proceeding
        const isValid = validateStep(currentStep);
        if (isValid) {
            // Clear validation errors when moving to next step
            setValidationErrors({});
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
        } else {
            // Scroll to top to show validation errors
            setTimeout(() => {
                const modalContent = document.querySelector('.overflow-y-auto');
                if (modalContent) {
                    modalContent.scrollTo({ top: 0, behavior: 'smooth' });
                }
            }, 100);
        }
    };

    const handlePrevious = () => {
        setCurrentStep(prev => Math.max(prev - 1, 0));
    };

    const handleSubmit = async (e) => {
        if (e) e.preventDefault();
        if (!validateStep(currentStep)) return;

        setSaving(true);
        try {
            // Helper to convert empty strings to null for optional fields
            const toNullIfEmpty = (value) => {
                if (value === '' || value === null || value === undefined) return null;
                return value;
            };
            
            // Helper to convert empty strings to undefined for optional fields
            const toUndefinedIfEmpty = (value) => {
                if (value === '' || value === null || value === undefined) return undefined;
                return value;
            };
            
            const couponData = {
                code: formData.code.trim(),
                discount_type: formData.discount_type,
                amount: formData.amount,
                description: toNullIfEmpty(formData.description),
                free_shipping: formData.free_shipping,
                date_expires: toNullIfEmpty(formData.date_expires),
                minimum_amount: toNullIfEmpty(formData.minimum_amount),
                maximum_amount: toNullIfEmpty(formData.maximum_amount),
                individual_use: formData.individual_use,
                exclude_sale_items: formData.exclude_sale_items,
                product_ids: formData.product_ids && formData.product_ids.length > 0 ? formData.product_ids : undefined,
                exclude_product_ids: formData.exclude_product_ids && formData.exclude_product_ids.length > 0 ? formData.exclude_product_ids : undefined,
                product_categories: formData.product_categories && formData.product_categories.length > 0 ? formData.product_categories : undefined,
                exclude_product_categories: formData.exclude_product_categories && formData.exclude_product_categories.length > 0 ? formData.exclude_product_categories : undefined,
                email_restrictions: formData.email_restrictions && formData.email_restrictions.length > 0 ? formData.email_restrictions : undefined,
                usage_limit: toNullIfEmpty(formData.usage_limit),
                usage_limit_per_user: toNullIfEmpty(formData.usage_limit_per_user),
            };

            if (coupon) {
                // Use React Query mutation for automatic cache invalidation
                await updateCouponMutation.mutateAsync({ id: coupon.id, data: couponData });
                alert(t('couponUpdated') || 'Coupon updated successfully');
            } else {
                // Use React Query mutation for automatic cache invalidation
                await createCouponMutation.mutateAsync(couponData);
                alert(t('couponCreated') || 'Coupon created successfully');
            }
            
            // Call onSave callback (which will trigger refetch in parent)
            onSave();
        } catch (err) {
            // SECURITY: Don't expose full error message in production
            const errorMessage = process.env.NODE_ENV === 'development' 
                ? err.message 
                : (err.code === 'NETWORK_ERROR' 
                    ? t('networkError') || 'Network error. Please check your connection.'
                    : t('error') || 'An error occurred');
            alert(errorMessage);
            secureLog.warn('Coupon save error:', err);
        } finally {
            setSaving(false);
        }
    };

    const addEmailRestriction = () => {
        const email = emailInput.trim();
        if (email && !formData.email_restrictions.includes(email)) {
            const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
            if (emailRegex.test(email)) {
                setFormData({
                    ...formData,
                    email_restrictions: [...formData.email_restrictions, email],
                });
                setEmailInput('');
            }
        }
    };

    const removeEmailRestriction = (email) => {
        setFormData({
            ...formData,
            email_restrictions: formData.email_restrictions.filter(e => e !== email),
        });
    };

    const toggleProductId = (id, isExclude = false) => {
        const key = isExclude ? 'exclude_product_ids' : 'product_ids';
        const currentIds = formData[key];
        if (currentIds.includes(id)) {
            setFormData({
                ...formData,
                [key]: currentIds.filter(pid => pid !== id),
            });
        } else {
            setFormData({
                ...formData,
                [key]: [...currentIds, id],
            });
        }
    };

    const toggleTempProductSelection = (id, isExclude = false) => {
        if (isExclude) {
            setTempSelectedExcludeProducts(prev => 
                prev.includes(id) 
                    ? prev.filter(pid => pid !== id)
                    : [...prev, id]
            );
        } else {
            setTempSelectedProducts(prev => 
                prev.includes(id) 
                    ? prev.filter(pid => pid !== id)
                    : [...prev, id]
            );
        }
    };

    const addSelectedProducts = (isExclude = false) => {
        if (isExclude) {
            setFormData({
                ...formData,
                exclude_product_ids: [...new Set([...formData.exclude_product_ids, ...tempSelectedExcludeProducts])],
            });
            setTempSelectedExcludeProducts([]);
            setExcludeProductSearch('');
            setShowExcludeProductDropdown(false);
        } else {
            setFormData({
                ...formData,
                product_ids: [...new Set([...formData.product_ids, ...tempSelectedProducts])],
            });
            setTempSelectedProducts([]);
            setProductSearch('');
            setShowProductDropdown(false);
        }
    };

    const removeProductId = (id, isExclude = false) => {
        const key = isExclude ? 'exclude_product_ids' : 'product_ids';
        setFormData({
            ...formData,
            [key]: formData[key].filter(pid => pid !== id),
        });
    };

    const toggleCategoryId = (id, isExclude = false) => {
        const key = isExclude ? 'exclude_product_categories' : 'product_categories';
        const currentIds = formData[key];
        if (currentIds.includes(id)) {
            setFormData({
                ...formData,
                [key]: currentIds.filter(cid => cid !== id),
            });
        } else {
            setFormData({
                ...formData,
                [key]: [...currentIds, id],
            });
        }
    };

    return {
        currentStep,
        steps,
        formData,
        setFormData,
        validationErrors,
        filteredProducts,
        filteredExcludeProducts,
        filteredCategories,
        productSearch,
        setProductSearch,
        excludeProductSearch,
        setExcludeProductSearch,
        categorySearch,
        setCategorySearch,
        emailInput,
        setEmailInput,
        saving,
        handleNext,
        handlePrevious,
        handleSubmit,
        addEmailRestriction,
        removeEmailRestriction,
        toggleProductId,
        toggleCategoryId,
        showProductDropdown,
        setShowProductDropdown,
        showExcludeProductDropdown,
        setShowExcludeProductDropdown,
        tempSelectedProducts,
        tempSelectedExcludeProducts,
        toggleTempProductSelection,
        addSelectedProducts,
        removeProductId,
        allProducts,
    };
};

export default useCouponModal;
