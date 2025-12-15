import React, { useState, useRef, useEffect, useMemo } from 'react';
import { createPortal } from 'react-dom';
import { DollarOutlined as DollarSign, MailOutlined as Mail, CloseOutlined as X, InfoCircleOutlined as InformationCircleIcon, InboxOutlined as Package } from '@ant-design/icons';
import SearchInput from '../../ui/inputs/SearchInput';
import { Button, OptimizedImage } from '../../ui';
import { Input } from '../../ui/inputs';
import { useLanguage } from '../../../contexts/LanguageContext';
import { validateImageUrl } from '../../Products/utils/securityHelpers';

// Simple tooltip component with portal to prevent clipping
const InfoTooltip = ({ text, isRTL }) => {
    const [showTooltip, setShowTooltip] = useState(false);
    const [position, setPosition] = useState({ top: 0, left: 0 });
    const iconRef = useRef(null);
    const tooltipRef = useRef(null);
    
    useEffect(() => {
        if (showTooltip && iconRef.current) {
            const updatePosition = () => {
                const rect = iconRef.current.getBoundingClientRect();
                const tooltipWidth = 250; // Approximate tooltip width
                const tooltipHeight = 100; // Approximate tooltip height
                const spacing = 8;
                
                let left, top;
                
                // Position below the icon, centered
                top = rect.bottom + spacing;
                left = rect.left + (rect.width / 2);
                
                // Check if tooltip would go off screen to the right
                if (left + tooltipWidth / 2 > window.innerWidth - 20) {
                    left = window.innerWidth - tooltipWidth / 2 - 20;
                }
                // Check if tooltip would go off screen to the left
                if (left - tooltipWidth / 2 < 20) {
                    left = tooltipWidth / 2 + 20;
                }
                
                // If tooltip would go off bottom, position above instead
                if (top + tooltipHeight > window.innerHeight - 20) {
                    top = rect.top - tooltipHeight - spacing;
                }
                
                setPosition({ top, left });
            };
            
            updatePosition();
            window.addEventListener('scroll', updatePosition, true);
            window.addEventListener('resize', updatePosition);
            
            return () => {
                window.removeEventListener('scroll', updatePosition, true);
                window.removeEventListener('resize', updatePosition);
            };
        }
    }, [showTooltip]);
    
    return (
        <>
            <div className="relative inline-block" ref={iconRef}>
                <InformationCircleIcon
                    className="w-4 h-4 text-gray-400 hover:text-gray-600 cursor-help inline-block"
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                />
            </div>
            {showTooltip && createPortal(
                <div
                    ref={tooltipRef}
                    className="fixed z-[10000] px-3 py-2 text-xs text-white bg-gray-900 rounded-lg shadow-xl whitespace-normal max-w-xs"
                    style={{ 
                        direction: isRTL ? 'rtl' : 'ltr',
                        minWidth: '200px',
                        top: `${position.top}px`,
                        left: `${position.left}px`,
                        transform: 'translateX(-50%)',
                        pointerEvents: 'none'
                    }}
                    onMouseEnter={() => setShowTooltip(true)}
                    onMouseLeave={() => setShowTooltip(false)}
                >
                    {text}
                    <div 
                        className="absolute left-1/2 bottom-full w-0 h-0 border-l-4 border-r-4 border-b-4 border-transparent border-b-gray-900"
                        style={{
                            transform: 'translateX(-50%)'
                        }}
                    ></div>
                </div>,
                document.body
            )}
        </>
    );
};

const UsageRestrictionsStep = ({
    formData,
    setFormData,
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
    addEmailRestriction,
    removeEmailRestriction,
    toggleProductId,
    toggleCategoryId,
    isRTL,
    t,
    validationErrors,
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
}) => {
    const { isRTL: contextRTL } = useLanguage();
    const rtl = isRTL !== undefined ? isRTL : contextRTL;
    const searchRef = useRef(null);
    const excludeSearchRef = useRef(null);
    
    // Close dropdown when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (searchRef.current && !searchRef.current.contains(event.target)) {
                setShowProductDropdown(false);
            }
            if (excludeSearchRef.current && !excludeSearchRef.current.contains(event.target)) {
                setShowExcludeProductDropdown(false);
            }
        };
        
        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className={`flex items-center gap-2 mb-2 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('minimumAmountTooltip') || 'סכום ההזמנה המינימלי הנדרש כדי שהקופון הזה יהיה תקף. השאר ריק ללא מינימום.'} 
                            isRTL={rtl}
                        />
                        <label htmlFor="minimum-amount" className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                            {t('minimumAmount') || 'סכום מינימלי'}
                        </label>
                    </div>
                    <Input
                        id="minimum-amount"
                        name="minimum_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.minimum_amount}
                        onChange={(e) => setFormData({ ...formData, minimum_amount: e.target.value })}
                        placeholder="0.00"
                        autoComplete="off"
                        label=""
                        rightIcon={DollarSign}
                        error={validationErrors?.minimum_amount}
                    />
                </div>

                <div>
                    <div className={`flex items-center gap-2 mb-2 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('maximumAmountTooltip') || 'סכום ההזמנה המקסימלי שבו ניתן להחיל את הקופון הזה. השאר ריק ללא מקסימום.'} 
                            isRTL={rtl}
                        />
                        <label htmlFor="maximum-amount" className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                            {t('maximumAmount') || 'סכום מקסימלי'}
                        </label>
                    </div>
                    <Input
                        id="maximum-amount"
                        name="maximum_amount"
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.maximum_amount}
                        onChange={(e) => setFormData({ ...formData, maximum_amount: e.target.value })}
                        placeholder="0.00"
                        autoComplete="off"
                        label=""
                        rightIcon={DollarSign}
                        error={validationErrors?.maximum_amount}
                    />
                </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className={`flex items-center gap-2 mb-2 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('individualUseTooltip') || 'כאשר מופעל, הקופון הזה לא יכול לשמש יחד עם קופונים אחרים.'} 
                            isRTL={rtl}
                        />
                        <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                            {t('individualUseOnly') || 'שימוש יחיד בלבד'}
                        </label>
                    </div>
                    <div className={`flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${rtl ? 'flex-row-reverse' : 'flex-row'}`} onClick={() => setFormData({ ...formData, individual_use: !formData.individual_use })}>
                        <input
                            type="checkbox"
                            id="individual_use"
                            name="individual_use"
                            checked={formData.individual_use}
                            onChange={(e) => setFormData({ ...formData, individual_use: e.target.checked })}
                            className="w-4 h-4 text-primary-500 rounded"
                        />
                        <label htmlFor="individual_use" className={`text-sm text-gray-700 cursor-pointer flex-1 ${rtl ? 'text-right' : 'text-left'}`}>
                            {t('individualUseOnly') || 'שימוש יחיד בלבד'}
                        </label>
                    </div>
                </div>

                <div>
                    <div className={`flex items-center gap-2 mb-2 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('excludeSaleItemsTooltip') || 'כאשר מופעל, הקופון הזה לא יחול על פריטים שנמצאים כרגע במבצע.'} 
                            isRTL={rtl}
                        />
                        <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                            {t('excludeSaleItems') || 'אל תחול על פריטים במבצע'}
                        </label>
                    </div>
                    <div className={`flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${rtl ? 'flex-row-reverse' : 'flex-row'}`} onClick={() => setFormData({ ...formData, exclude_sale_items: !formData.exclude_sale_items })}>
                        <input
                            type="checkbox"
                            id="exclude_sale_items"
                            name="exclude_sale_items"
                            checked={formData.exclude_sale_items}
                            onChange={(e) => setFormData({ ...formData, exclude_sale_items: e.target.checked })}
                            className="w-4 h-4 text-primary-500 rounded"
                        />
                        <label htmlFor="exclude_sale_items" className={`text-sm text-gray-700 cursor-pointer flex-1 ${rtl ? 'text-right' : 'text-left'}`}>
                            {t('excludeSaleItems') || 'אל תחול על פריטים במבצע'}
                        </label>
                    </div>
                </div>
            </div>

            {/* Products */}
            <div className="card">
                <div className={`flex items-center gap-2 mb-3 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('productsTooltip') || 'בחר מוצרים ספציפיים שהקופון הזה יכול לחול עליהם. השאר ריק כדי לאפשר את הקופון על כל המוצרים.'} 
                        isRTL={rtl}
                    />
                    <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                        {t('products') || 'מוצרים'}
                    </label>
                </div>
                
                {/* Search Input with Dropdown */}
                <div className="mb-3 relative" ref={searchRef}>
                    <SearchInput
                        value={productSearch}
                        onChange={(value) => {
                            setProductSearch(value);
                            setShowProductDropdown(value.length > 0);
                        }}
                        onFocus={() => {
                            if (productSearch.length > 0) {
                                setShowProductDropdown(true);
                            }
                        }}
                        placeholder={t('searchProducts') || 'Search products...'}
                        isRTL={isRTL}
                    />
                    
                    {/* Dropdown Results */}
                    {showProductDropdown && filteredProducts.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {filteredProducts.map(product => {
                                const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
                                const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;
                                const isSelected = tempSelectedProducts.includes(product.id);
                                const isAlreadyAdded = formData.product_ids.includes(product.id);
                                
                                return (
                                    <div 
                                        key={product.id} 
                                        className={`flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors ${isAlreadyAdded ? 'opacity-50' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected || isAlreadyAdded}
                                            disabled={isAlreadyAdded}
                                            onChange={() => !isAlreadyAdded && toggleTempProductSelection(product.id, false)}
                                            className="w-4 h-4 text-primary-500 rounded flex-shrink-0"
                                        />
                                        <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                            {imageUrl ? (
                                                <OptimizedImage
                                                    src={imageUrl}
                                                    alt={product.name || ''}
                                                    className="w-full h-full object-cover"
                                                    resize={true}
                                                    width={40}
                                                    height={40}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-700 truncate">{product.name}</div>
                                            {product.sku && (
                                                <div className="text-xs text-gray-500">{product.sku}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Add Button */}
                            {tempSelectedProducts.length > 0 && (
                                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={() => addSelectedProducts(false)}
                                        className="w-full"
                                    >
                                        {t('addSelected') || 'Add Selected'} ({tempSelectedProducts.length})
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {showProductDropdown && productSearch.length > 0 && filteredProducts.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                            <p className="text-sm text-gray-500 text-center">{t('noProductsFound') || 'No products found'}</p>
                        </div>
                    )}
                </div>
                
                {/* Selected Products List */}
                {formData.product_ids.length > 0 && (
                    <div className="space-y-2">
                        {formData.product_ids.map(productId => {
                            const product = Array.isArray(allProducts) ? allProducts.find(p => p.id === productId) : null;
                            if (!product) return null;
                            
                            const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
                            const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;
                            
                            return (
                                <div key={productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                    <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                        {imageUrl ? (
                                            <OptimizedImage
                                                src={imageUrl}
                                                alt={product.name || ''}
                                                className="w-full h-full object-cover"
                                                resize={true}
                                                width={32}
                                                height={32}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-700 truncate">{product.name}</div>
                                        {product.sku && (
                                            <div className="text-xs text-gray-500">{product.sku}</div>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeProductId(productId, false)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Exclude Products */}
            <div className="card">
                <div className={`flex items-center gap-2 mb-3 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('excludeProductsTooltip') || 'בחר מוצרים שהקופון הזה לא יכול לחול עליהם, גם אם הם תואמים קריטריונים אחרים.'} 
                        isRTL={rtl}
                    />
                    <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                        {t('excludeProducts') || 'אל תחול על מוצרים'}
                    </label>
                </div>
                
                {/* Search Input with Dropdown */}
                <div className="mb-3 relative" ref={excludeSearchRef}>
                    <SearchInput
                        value={excludeProductSearch}
                        onChange={(value) => {
                            setExcludeProductSearch(value);
                            setShowExcludeProductDropdown(value.length > 0);
                        }}
                        onFocus={() => {
                            if (excludeProductSearch.length > 0) {
                                setShowExcludeProductDropdown(true);
                            }
                        }}
                        placeholder={t('searchProducts') || 'Search products...'}
                        isRTL={isRTL}
                    />
                    
                    {/* Dropdown Results */}
                    {showExcludeProductDropdown && filteredExcludeProducts.length > 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-64 overflow-y-auto">
                            {filteredExcludeProducts.map(product => {
                                const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
                                const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;
                                const isSelected = tempSelectedExcludeProducts.includes(product.id);
                                const isAlreadyAdded = formData.exclude_product_ids.includes(product.id);
                                
                                return (
                                    <div 
                                        key={product.id} 
                                        className={`flex items-center gap-2 p-2 hover:bg-gray-50 transition-colors ${isAlreadyAdded ? 'opacity-50' : ''}`}
                                    >
                                        <input
                                            type="checkbox"
                                            checked={isSelected || isAlreadyAdded}
                                            disabled={isAlreadyAdded}
                                            onChange={() => !isAlreadyAdded && toggleTempProductSelection(product.id, true)}
                                            className="w-4 h-4 text-primary-500 rounded flex-shrink-0"
                                        />
                                        <div className="w-10 h-10 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                            {imageUrl ? (
                                                <OptimizedImage
                                                    src={imageUrl}
                                                    alt={product.name || ''}
                                                    className="w-full h-full object-cover"
                                                    resize={true}
                                                    width={40}
                                                    height={40}
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <Package className="w-5 h-5 text-gray-400" />
                                                </div>
                                            )}
                                        </div>
                                        <div className="flex-1 min-w-0">
                                            <div className="text-sm text-gray-700 truncate">{product.name}</div>
                                            {product.sku && (
                                                <div className="text-xs text-gray-500">{product.sku}</div>
                                            )}
                                        </div>
                                    </div>
                                );
                            })}
                            
                            {/* Add Button */}
                            {tempSelectedExcludeProducts.length > 0 && (
                                <div className="sticky bottom-0 bg-white border-t border-gray-200 p-2">
                                    <Button
                                        type="button"
                                        variant="primary"
                                        onClick={() => addSelectedProducts(true)}
                                        className="w-full"
                                    >
                                        {t('addSelected') || 'Add Selected'} ({tempSelectedExcludeProducts.length})
                                    </Button>
                                </div>
                            )}
                        </div>
                    )}
                    
                    {showExcludeProductDropdown && excludeProductSearch.length > 0 && filteredExcludeProducts.length === 0 && (
                        <div className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg p-4">
                            <p className="text-sm text-gray-500 text-center">{t('noProductsFound') || 'No products found'}</p>
                        </div>
                    )}
                </div>
                
                {/* Selected Products List */}
                {formData.exclude_product_ids.length > 0 && (
                    <div className="space-y-2">
                        {formData.exclude_product_ids.map(productId => {
                            const product = Array.isArray(allProducts) ? allProducts.find(p => p.id === productId) : null;
                            if (!product) return null;
                            
                            const rawImageUrl = product.images && product.images.length > 0 ? product.images[0].src : null;
                            const imageUrl = rawImageUrl ? validateImageUrl(rawImageUrl) : null;
                            
                            return (
                                <div key={productId} className="flex items-center gap-2 p-2 bg-gray-50 rounded border border-gray-200">
                                    <div className="w-8 h-8 flex-shrink-0 rounded overflow-hidden bg-gray-100">
                                        {imageUrl ? (
                                            <OptimizedImage
                                                src={imageUrl}
                                                alt={product.name || ''}
                                                className="w-full h-full object-cover"
                                                resize={true}
                                                width={32}
                                                height={32}
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center">
                                                <Package className="w-4 h-4 text-gray-400" />
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <div className="text-sm text-gray-700 truncate">{product.name}</div>
                                        {product.sku && (
                                            <div className="text-xs text-gray-500">{product.sku}</div>
                                        )}
                                    </div>
                                    <Button
                                        type="button"
                                        variant="ghost"
                                        onClick={() => removeProductId(productId, true)}
                                        className="text-gray-400 hover:text-red-500 p-1"
                                    >
                                        <X className="w-4 h-4" />
                                    </Button>
                                </div>
                            );
                        })}
                    </div>
                )}
            </div>

            {/* Categories */}
            <div className="card">
                <div className={`flex items-center gap-2 mb-3 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('productCategoriesTooltip') || 'בחר קטגוריות מוצרים שהקופון הזה יכול לחול עליהן. השאר ריק כדי לאפשר את הקופון על כל הקטגוריות.'} 
                        isRTL={rtl}
                    />
                    <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                        {t('productCategories') || 'קטגוריות מוצרים'}
                    </label>
                </div>
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
                <div className={`flex items-center gap-2 mb-3 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('excludeCategoriesTooltip') || 'בחר קטגוריות מוצרים שהקופון הזה לא יכול לחול עליהן, גם אם הן תואמות קריטריונים אחרים.'} 
                        isRTL={rtl}
                    />
                    <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                        {t('excludeCategories') || 'אל תחול על קטגוריות'}
                    </label>
                </div>
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
                <div className={`flex items-center gap-2 mb-3 ${rtl ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('allowedEmailsTooltip') || 'הגבל את הקופון הזה לכתובות אימייל ספציפיות. רק לקוחות עם כתובות האימייל האלה יוכלו להשתמש בקופון הזה.'} 
                        isRTL={rtl}
                    />
                    <label className={`block text-sm font-medium text-gray-700 ${rtl ? 'text-right' : 'text-left'}`}>
                        {t('allowedEmails') || 'אימיילים מורשים'}
                    </label>
                </div>
                <div className={`flex gap-2 items-end ${rtl ? 'flex-row-reverse' : 'flex-row'}`}>
                    <div className="flex-1">
                        <Input
                            id="email-restriction-input"
                            name="emailRestriction"
                            type="email"
                            value={emailInput}
                            onChange={(e) => setEmailInput(e.target.value)}
                            onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addEmailRestriction())}
                            placeholder={t('enterEmail') || 'Enter email address'}
                            autoComplete="email"
                            label=""
                            rightIcon={Mail}
                        />
                    </div>
                    <Button
                        type="button"
                        onClick={addEmailRestriction}
                        variant="secondary"
                        className="mb-[2px]" // Align with input
                    >
                        {t('add') || 'Add'}
                    </Button>
                </div>
                {formData.email_restrictions.length > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                        {formData.email_restrictions.map((email, index) => (
                            <span
                                key={index}
                                className="inline-flex items-center gap-1 px-3 py-1 bg-primary-50 text-primary-700 rounded-full text-sm"
                            >
                                {email}
                                <Button
                                    type="button"
                                    variant="ghost"
                                    onClick={() => removeEmailRestriction(email)}
                                    className="text-primary-700 hover:text-primary-900 p-0 h-auto w-auto min-w-0"
                                >
                                    <X className="w-3.5 h-3.5" />
                                </Button>
                            </span>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
};

export default UsageRestrictionsStep;
