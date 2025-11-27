import { useState, useEffect, useMemo } from 'react';
import { X, Save, Tag, Percent, DollarSign, Calendar, Users, Package, Mail, ChevronLeft, ChevronRight, Search, CheckCircle } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import { couponsAPI, productsAPI, categoriesAPI } from '../../services/woocommerce';

/**
 * CouponModal Component
 * 
 * Optimized modal for creating and editing coupons with step-by-step wizard.
 * 
 * @param {Object} coupon - Coupon object to edit (null for new coupon)
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onSave - Callback when coupon is saved
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CouponModal = ({ coupon, onClose, onSave, formatCurrency, isRTL, t }) => {
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
  const [allProducts, setAllProducts] = useState([]);
  const [allCategories, setAllCategories] = useState([]);
  const [loading, setLoading] = useState(false);
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
    loadProducts();
    loadCategories();
  }, []);

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

  const loadProducts = async () => {
    try {
      setLoading(true);
      const data = await productsAPI.getAll({ per_page: 100 });
      setAllProducts(data);
    } catch (err) {
      console.error('Failed to load products:', err);
    } finally {
      setLoading(false);
    }
  };

  const loadCategories = async () => {
    try {
      const data = await categoriesAPI.getAll();
      setAllCategories(data);
    } catch (err) {
      console.error('Failed to load categories:', err);
    }
  };

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
    e.preventDefault();
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

  const renderStepContent = () => {
    switch (currentStep) {
      case 0:
        return (
          <div className="space-y-6">
            <div>
              <label htmlFor="coupon-code" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                {t('couponCode') || 'Coupon Code'} *
              </label>
              <input
                id="coupon-code"
                name="code"
                type="text"
                value={formData.code}
                onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                className={`input-field ${validationErrors.code ? 'border-red-500' : ''}`}
                placeholder={t('enterCouponCode') || 'Enter coupon code'}
                required
                autoComplete="off"
              />
              {validationErrors.code && (
                <p className="text-red-500 text-sm mt-1">{validationErrors.code}</p>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="discount-type" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('discountType') || 'Discount Type'} *
                </label>
                <select
                  id="discount-type"
                  name="discount_type"
                  value={formData.discount_type}
                  onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                  className="input-field"
                >
                  <option value="percent">{t('percentageDiscount') || 'Percentage discount'}</option>
                  <option value="fixed_cart">{t('fixedCartDiscount') || 'Fixed cart discount'}</option>
                  <option value="fixed_product">{t('fixedProductDiscount') || 'Fixed product discount'}</option>
                </select>
              </div>

              <div>
                <label htmlFor="coupon-amount" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('amount') || 'Amount'} *
                </label>
                <div className="relative">
                  {formData.discount_type === 'percent' ? (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <Percent size={18} className="text-gray-400" />
                    </div>
                  ) : (
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <DollarSign size={18} className="text-gray-400" />
                    </div>
                  )}
                  <input
                    id="coupon-amount"
                    name="amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.amount}
                    onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                    className={`input-field pr-10 ${validationErrors.amount ? 'border-red-500' : ''}`}
                    placeholder={formData.discount_type === 'percent' ? '10' : '50.00'}
                    required
                    autoComplete="off"
                  />
                </div>
                {validationErrors.amount && (
                  <p className="text-red-500 text-sm mt-1">{validationErrors.amount}</p>
                )}
              </div>
            </div>

            <div>
              <label htmlFor="coupon-description" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                {t('description') || 'Description'}
              </label>
              <textarea
                id="coupon-description"
                name="description"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                className="input-field"
                rows="3"
                placeholder={t('couponDescription') || 'Internal description (not visible to customers)'}
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, free_shipping: !formData.free_shipping })}>
                <input
                  type="checkbox"
                  id="free_shipping"
                  name="free_shipping"
                  checked={formData.free_shipping}
                  onChange={(e) => setFormData({ ...formData, free_shipping: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label htmlFor="free_shipping" className="text-sm text-gray-700 cursor-pointer flex-1">
                  {t('allowFreeShipping') || 'Allow free shipping'}
                </label>
              </div>

              <div>
                <label htmlFor="coupon-expiry-date" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('expiryDate') || 'Expiry Date'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Calendar size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="coupon-expiry-date"
                    name="date_expires"
                    type="date"
                    value={formData.date_expires}
                    onChange={(e) => setFormData({ ...formData, date_expires: e.target.value })}
                    className="input-field pr-10"
                  />
                </div>
              </div>
            </div>
          </div>
        );

      case 1:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label htmlFor="minimum-amount" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('minimumAmount') || 'Minimum Amount'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <DollarSign size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="minimum-amount"
                    name="minimum_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.minimum_amount}
                    onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                    className="input-field pr-10"
                    placeholder="0.00"
                    autoComplete="off"
                  />
                </div>
              </div>

              <div>
                <label htmlFor="maximum-amount" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('maximumAmount') || 'Maximum Amount'}
                </label>
                <div className="relative">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <DollarSign size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="maximum-amount"
                    name="maximum_amount"
                    type="number"
                    step="0.01"
                    min="0"
                    value={formData.maximum_amount}
                    onChange={(e) => setFormData({ ...formData, maximum_amount: e.target.value })}
                    className="input-field pr-10"
                    placeholder="0.00"
                    autoComplete="off"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, individual_use: !formData.individual_use })}>
                <input
                  type="checkbox"
                  id="individual_use"
                  name="individual_use"
                  checked={formData.individual_use}
                  onChange={(e) => setFormData({ ...formData, individual_use: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label htmlFor="individual_use" className="text-sm text-gray-700 cursor-pointer flex-1">
                  {t('individualUseOnly') || 'Individual use only'}
                </label>
              </div>

              <div className="flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer" onClick={() => setFormData({ ...formData, exclude_sale_items: !formData.exclude_sale_items })}>
                <input
                  type="checkbox"
                  id="exclude_sale_items"
                  name="exclude_sale_items"
                  checked={formData.exclude_sale_items}
                  onChange={(e) => setFormData({ ...formData, exclude_sale_items: e.target.checked })}
                  className="w-4 h-4 text-primary-500 rounded"
                />
                <label htmlFor="exclude_sale_items" className="text-sm text-gray-700 cursor-pointer flex-1">
                  {t('excludeSaleItems') || 'Exclude sale items'}
                </label>
              </div>
            </div>

            {/* Products */}
            <div className="card">
              <label className={`block text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
                {t('products') || 'Products'}
              </label>
              <div className="relative mb-3">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  id="product-search"
                  name="productSearch"
                  type="text"
                  value={productSearch}
                  onChange={(e) => setProductSearch(e.target.value)}
                  className="input-field pr-10"
                  placeholder={t('searchProducts') || 'Search products...'}
                  autoComplete="off"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('noProductsFound') || 'No products found'}</p>
                ) : (
                  filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                      <input
                        id={`product-${product.id}`}
                        name={`product_ids`}
                        type="checkbox"
                        value={product.id}
                        checked={formData.product_ids.includes(product.id)}
                        onChange={() => toggleProductId(product.id)}
                        className="w-4 h-4 text-primary-500 rounded"
                      />
                      <label htmlFor={`product-${product.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">{product.name}</label>
                      {product.sku && (
                        <span className="text-xs text-gray-500">({product.sku})</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              {formData.product_ids.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.product_ids.length} {t('selected') || 'selected'}
                </p>
              )}
            </div>

            {/* Exclude Products */}
            <div className="card">
              <label className={`block text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
                {t('excludeProducts') || 'Exclude Products'}
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                {filteredProducts.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('noProductsFound') || 'No products found'}</p>
                ) : (
                  filteredProducts.map(product => (
                    <div key={product.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                      <input
                        id={`exclude-product-${product.id}`}
                        name={`exclude_product_ids`}
                        type="checkbox"
                        value={product.id}
                        checked={formData.exclude_product_ids.includes(product.id)}
                        onChange={() => toggleProductId(product.id, true)}
                        className="w-4 h-4 text-primary-500 rounded"
                      />
                      <label htmlFor={`exclude-product-${product.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">{product.name}</label>
                      {product.sku && (
                        <span className="text-xs text-gray-500">({product.sku})</span>
                      )}
                    </div>
                  ))
                )}
              </div>
              {formData.exclude_product_ids.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.exclude_product_ids.length} {t('selected') || 'selected'}
                </p>
              )}
            </div>

            {/* Categories */}
            <div className="card">
              <label className={`block text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
                {t('productCategories') || 'Product Categories'}
              </label>
              <div className="relative mb-3">
                <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                  <Search size={18} className="text-gray-400" />
                </div>
                <input
                  id="category-search"
                  name="categorySearch"
                  type="text"
                  value={categorySearch}
                  onChange={(e) => setCategorySearch(e.target.value)}
                  className="input-field pr-10"
                  placeholder={t('searchCategories') || 'Search categories...'}
                  autoComplete="off"
                />
              </div>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('noCategoriesFound') || 'No categories found'}</p>
                ) : (
                  filteredCategories.map(category => (
                    <div key={category.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                      <input
                        id={`category-${category.id}`}
                        name={`product_categories`}
                        type="checkbox"
                        value={category.id}
                        checked={formData.product_categories.includes(category.id)}
                        onChange={() => toggleCategoryId(category.id)}
                        className="w-4 h-4 text-primary-500 rounded"
                      />
                      <label htmlFor={`category-${category.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">{category.name}</label>
                    </div>
                  ))
                )}
              </div>
              {formData.product_categories.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.product_categories.length} {t('selected') || 'selected'}
                </p>
              )}
            </div>

            {/* Exclude Categories */}
            <div className="card">
              <label className={`block text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
                {t('excludeCategories') || 'Exclude Categories'}
              </label>
              <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                {filteredCategories.length === 0 ? (
                  <p className="text-sm text-gray-500 text-center py-4">{t('noCategoriesFound') || 'No categories found'}</p>
                ) : (
                  filteredCategories.map(category => (
                    <div key={category.id} className="flex items-center gap-2 py-2 hover:bg-gray-50 rounded px-2 transition-colors">
                      <input
                        id={`exclude-category-${category.id}`}
                        name={`exclude_product_categories`}
                        type="checkbox"
                        value={category.id}
                        checked={formData.exclude_product_categories.includes(category.id)}
                        onChange={() => toggleCategoryId(category.id, true)}
                        className="w-4 h-4 text-primary-500 rounded"
                      />
                      <label htmlFor={`exclude-category-${category.id}`} className="text-sm text-gray-700 flex-1 cursor-pointer">{category.name}</label>
                    </div>
                  ))
                )}
              </div>
              {formData.exclude_product_categories.length > 0 && (
                <p className="text-xs text-gray-500 mt-2">
                  {formData.exclude_product_categories.length} {t('selected') || 'selected'}
                </p>
              )}
            </div>

            {/* Email Restrictions */}
            <div className="card">
              <label className={`block text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
                {t('allowedEmails') || 'Allowed Emails'}
              </label>
              <div className={`flex gap-2 ${'flex-row-reverse'}`}>
                <div className="relative flex-1">
                  <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                    <Mail size={18} className="text-gray-400" />
                  </div>
                  <input
                    id="email-restriction-input"
                    name="emailRestriction"
                    type="email"
                    value={emailInput}
                    onChange={(e) => setEmailInput(e.target.value)}
                    onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmailRestriction())}
                    className="input-field pr-10"
                    placeholder={t('enterEmail') || 'Enter email address'}
                    autoComplete="email"
                  />
                </div>
                <button
                  type="button"
                  onClick={addEmailRestriction}
                  className="btn-secondary"
                >
                  {t('add') || 'Add'}
                </button>
              </div>
              {formData.email_restrictions.length > 0 && (
                <div className="mt-3 flex flex-wrap gap-2">
                  {formData.email_restrictions.map((email, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                    >
                      {email}
                      <button
                        type="button"
                        onClick={() => removeEmailRestriction(email)}
                        className="text-primary-700 hover:text-primary-900 transition-colors"
                      >
                        <X size={14} />
                      </button>
                    </span>
                  ))}
                </div>
              )}
            </div>
          </div>
        );

      case 2:
        return (
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="card">
                <label htmlFor="usage-limit" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('usageLimitPerCoupon') || 'Usage Limit Per Coupon'}
                </label>
                <input
                  id="usage-limit"
                  name="usage_limit"
                  type="number"
                  min="0"
                  value={formData.usage_limit}
                  onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                  className="input-field"
                  autoComplete="off"
                  placeholder={t('unlimited') || 'Unlimited'}
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('usageLimitPerCouponDesc') || 'Leave empty for unlimited uses'}
                </p>
              </div>

              <div className="card">
                <label htmlFor="usage-limit-per-user" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                  {t('usageLimitPerUser') || 'Usage Limit Per User'}
                </label>
                <input
                  id="usage-limit-per-user"
                  name="usage_limit_per_user"
                  type="number"
                  min="0"
                  value={formData.usage_limit_per_user}
                  onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                  className="input-field"
                  placeholder={t('unlimited') || 'Unlimited'}
                  autoComplete="off"
                />
                <p className="text-xs text-gray-500 mt-1">
                  {t('usageLimitPerUserDesc') || 'Leave empty for unlimited uses per user'}
                </p>
              </div>
            </div>
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div
        className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-200">
          <div>
            <h2 className={`text-xl font-semibold text-gray-900 ${'text-right'}`}>
              {coupon ? t('editCoupon') || 'Edit Coupon' : t('createCoupon') || 'Create Coupon'}
            </h2>
            <p className={`text-sm text-gray-500 mt-1 ${'text-right'}`}>
              {t('step')} {currentStep + 1} {t('of')} {steps.length}
            </p>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X size={24} />
          </button>
        </div>

        {/* Steps Indicator */}
        <div className="px-6 py-4 border-b border-gray-200 bg-gray-50">
          <div className={`flex items-center ${'flex-row-reverse'} justify-between`}>
            {steps.map((step, index) => {
              const Icon = step.icon;
              const isActive = currentStep === index;
              const isCompleted = currentStep > index;
              
              return (
                <div key={step.id} className={`flex items-center ${'flex-row-reverse'} flex-1`}>
                  <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                    <div className={`flex items-center justify-center w-10 h-10 rounded-full border-2 transition-colors ${
                      isActive 
                        ? 'border-primary-500 bg-primary-500 text-white' 
                        : isCompleted
                        ? 'border-primary-500 bg-primary-500 text-white'
                        : 'border-gray-300 bg-white text-gray-400'
                    }`}>
                      {isCompleted ? (
                        <CheckCircle size={20} />
                      ) : (
                        <Icon size={20} />
                      )}
                    </div>
                    <span className={`text-sm font-medium ${isActive ? 'text-primary-500' : isCompleted ? 'text-primary-500' : 'text-gray-500'}`}>
                      {step.label}
                    </span>
                  </div>
                  {index < steps.length - 1 && (
                    <div className={`flex-1 h-0.5 mx-4 ${isCompleted ? 'bg-primary-500' : 'bg-gray-300'}`} />
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Content */}
        <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto p-6">
          {renderStepContent()}
        </form>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-200 bg-gray-50 sticky bottom-0">
          <button
            type="button"
            onClick={onClose}
            className="btn-secondary"
            disabled={saving}
          >
            {t('cancel') || 'Cancel'}
          </button>
          
          <div className={`flex items-center gap-3 ${'flex-row-reverse'}`}>
            {currentStep > 0 && (
              <button
                type="button"
                onClick={handlePrevious}
                className="btn-secondary flex items-center flex-row-reverse space-x-reverse"
                disabled={saving}
              >
                <ChevronLeft size={18} />
                <span>{t('previous') || 'Previous'}</span>
              </button>
            )}
            
            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={handleNext}
                className="btn-primary flex items-center flex-row-reverse space-x-reverse"
                disabled={saving}
              >
                <span>{t('next') || 'Next'}</span>
                <ChevronRight size={18} />
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                className="btn-primary flex items-center flex-row-reverse space-x-reverse disabled:opacity-50 disabled:cursor-not-allowed"
                disabled={saving}
              >
                <Save size={18} />
                <span>{saving ? t('saving') : coupon ? t('update') : t('createCoupon')}</span>
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default CouponModal;
