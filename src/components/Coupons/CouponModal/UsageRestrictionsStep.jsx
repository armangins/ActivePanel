import React from 'react';
import { CurrencyDollarIcon as DollarSign, EnvelopeIcon as Mail, XMarkIcon as X } from '@heroicons/react/24/outline';
import SearchInput from '../../ui/inputs/SearchInput';

const UsageRestrictionsStep = ({
    formData,
    setFormData,
    filteredProducts,
    filteredCategories,
    productSearch,
    setProductSearch,
    categorySearch,
    setCategorySearch,
    emailInput,
    setEmailInput,
    addEmailRestriction,
    removeEmailRestriction,
    toggleProductId,
    toggleCategoryId,
    isRTL,
    t
}) => {
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <label htmlFor="minimum-amount" className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
                        {t('minimumAmount') || 'Minimum Amount'}
                    </label>
                    <div className="relative">
                        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                            <DollarSign className="w-[18px] h-[18px] text-gray-400" />
                        </div>
                        <input
                            id="minimum-amount"
                            name="minimum_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.minimum_amount}
                            onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                            className="input-field pl-10"
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
                            <DollarSign className="w-[18px] h-[18px] text-gray-400" />
                        </div>
                        <input
                            id="maximum-amount"
                            name="maximum_amount"
                            type="number"
                            step="0.01"
                            min="0"
                            value={formData.maximum_amount}
                            onChange={(e) => setFormData({ ...formData, maximum_amount: e.target.value })}
                            className="input-field pl-10"
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
                <div className="mb-3">
                    <SearchInput
                        value={productSearch}
                        onChange={setProductSearch}
                        placeholder={t('searchProducts') || 'Search products...'}
                        isRTL={isRTL}
                    />
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                    {filteredProducts.length === 0 ? (
                        <p className="text-sm text-gray-500 text-right py-4">{t('noProductsFound') || 'No products found'}</p>
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
                        <p className="text-sm text-gray-500 text-right py-4">{t('noProductsFound') || 'No products found'}</p>
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
                <div className="mb-3">
                    <SearchInput
                        value={categorySearch}
                        onChange={setCategorySearch}
                        placeholder={t('searchCategories') || 'Search categories...'}
                        isRTL={isRTL}
                    />
                </div>
                <div className="max-h-48 overflow-y-auto border border-gray-200 rounded p-2">
                    {filteredCategories.length === 0 ? (
                        <p className="text-sm text-gray-500 text-right py-4">{t('noCategoriesFound') || 'No categories found'}</p>
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
                        <p className="text-sm text-gray-500 text-right py-4">{t('noCategoriesFound') || 'No categories found'}</p>
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
                            <Mail className="w-[18px] h-[18px] text-gray-400" />
                        </div>
                        <input
                            id="email-restriction-input"
                            name="emailRestriction"
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmailRestriction())}
                            className="input-field pl-10"
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
                                    <X className="w-3.5 h-3.5" />
                                </button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsageRestrictionsStep;
