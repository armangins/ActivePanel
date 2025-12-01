import { useState, useEffect, useMemo } from 'react';
import { useQuery } from '@tanstack/react-query';
import { TagIcon as Tag, UsersIcon as Users, CubeIcon as Package } from '@heroicons/react/24/outline';
import { couponsAPI, productsAPI, categoriesAPI } from '../../../services/woocommerce';

const useCouponModal = (coupon, onClose, onSave, t) => {
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
    const { data: allProducts = [], isLoading: productsLoading } = useQuery({
        queryKey: ['products', 'all'],
        queryFn: () => productsAPI.getAll({ per_page: 100 }),
        staleTime: 60 * 60 * 1000, // 1 hour cache
    });

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
    const [categorySearch, setCategorySearch] = useState('');

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
        if (!productSearch) return allProducts.slice(0, 50);
        const query = productSearch.toLowerCase();
        return allProducts.filter(p =>
            p.name?.toLowerCase().includes(query) ||
            p.sku?.toLowerCase().includes(query)
        ).slice(0, 50);
    }, [allProducts, productSearch]);

    const filteredCategories = useMemo(() => {
        if (!categorySearch) return allCategories;
        const query = categorySearch.toLowerCase();
        return allCategories.filter(c =>
            c.name?.toLowerCase().includes(query)
        );
    }, [allCategories, categorySearch]);

    const validateStep = (step) => {
        const errors = {};
        if (step === 0) {
            if (!formData.code || formData.code.trim() === '') {
                errors.code = t('couponCodeRequired') || 'Coupon code is required';
            }
            if (!formData.amount || parseFloat(formData.amount) <= 0) {
                errors.amount = t('amountRequired') || 'Amount is required';
            }
        }
        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleNext = () => {
        if (validateStep(currentStep)) {
            setCurrentStep(prev => Math.min(prev + 1, steps.length - 1));
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
            const couponData = {
                code: formData.code.trim(),
                discount_type: formData.discount_type,
                amount: formData.amount,
                description: formData.description || '',
                free_shipping: formData.free_shipping,
                date_expires: formData.date_expires || '',
                minimum_amount: formData.minimum_amount || '',
                maximum_amount: formData.maximum_amount || '',
                individual_use: formData.individual_use,
                exclude_sale_items: formData.exclude_sale_items,
                product_ids: formData.product_ids,
                exclude_product_ids: formData.exclude_product_ids,
                product_categories: formData.product_categories,
                exclude_product_categories: formData.exclude_product_categories,
                email_restrictions: formData.email_restrictions,
                usage_limit: formData.usage_limit || '',
                usage_limit_per_user: formData.usage_limit_per_user || '',
            };

            if (coupon) {
                await couponsAPI.update(coupon.id, couponData);
                alert(t('couponUpdated') || 'Coupon updated successfully');
            } else {
                await couponsAPI.create(couponData);
                alert(t('couponCreated') || 'Coupon created successfully');
            }
            onSave();
        } catch (err) {
            alert(t('error') + ': ' + err.message);
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
        filteredCategories,
        productSearch,
        setProductSearch,
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
    };
};

export default useCouponModal;
