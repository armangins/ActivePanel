import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { TagIcon as Tag, HashtagIcon as Percent, CurrencyDollarIcon as DollarSign, CalendarIcon, InformationCircleIcon } from '@heroicons/react/24/outline';
import { Input } from '../../ui/inputs';
import { useLanguage } from '../../../contexts/LanguageContext';

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

const GeneralSettingsStep = ({ formData, setFormData, validationErrors, t }) => {
    const { isRTL } = useLanguage();
    
    return (
        <div className="space-y-6">
            <div>
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('couponCodeTooltip') || 'הכנס קוד ייחודי שהלקוחות ישתמשו בו להחלת הקופון בקופה. הקוד רגיש לאותיות גדולות וקטנות.'} 
                        isRTL={isRTL}
                    />
                    <label htmlFor="coupon-code" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('couponCode') || 'קוד קופון'}
                        <span className={`text-orange-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>
                    </label>
                </div>
                <Input
                    id="coupon-code"
                    name="code"
                    label=""
                    type="text"
                    value={formData.code}
                    onChange={(e) => setFormData({ ...formData, code: e.target.value })}
                    placeholder={t('enterCouponCode') || 'הכנס קוד קופון'}
                    error={validationErrors.code}
                    required
                    leftIcon={Tag}
                    autoComplete="off"
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('discountTypeTooltip') || 'אחוז: הנחה כאחוז מסך ההזמנה. הנחה קבועה לעגלה: הנחה בסכום קבוע לכל העגלה. הנחה קבועה למוצר: הנחה בסכום קבוע לכל מוצר.'} 
                            isRTL={isRTL}
                        />
                        <label htmlFor="discount-type" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('discountType') || 'סוג הנחה'}
                            <span className={`text-orange-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>
                        </label>
                    </div>
                    <select
                        id="discount-type"
                        name="discount_type"
                        value={formData.discount_type}
                        onChange={(e) => setFormData({ ...formData, discount_type: e.target.value })}
                        className="input-field"
                        required
                    >
                        <option value="percent">{t('percentageDiscount') || 'הנחה באחוזים'}</option>
                        <option value="fixed_cart">{t('fixedCartDiscount') || 'הנחה קבועה לעגלה'}</option>
                        <option value="fixed_product">{t('fixedProductDiscount') || 'הנחה קבועה למוצר'}</option>
                    </select>
                </div>

                <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={formData.discount_type === 'percent' 
                                ? (t('amountTooltipPercent') || 'הכנס את אחוז ההנחה (למשל, 10 עבור 10% הנחה).')
                                : (t('amountTooltipFixed') || 'הכנס את סכום ההנחה הקבוע במטבע החנות שלך.')} 
                            isRTL={isRTL}
                        />
                        <label htmlFor="coupon-amount" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('amount') || 'סכום'}
                            <span className={`text-orange-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>
                        </label>
                    </div>
                    <Input
                        id="coupon-amount"
                        name="amount"
                        label=""
                        type="number"
                        step="0.01"
                        min="0"
                        value={formData.amount}
                        onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                        placeholder={formData.discount_type === 'percent' ? '10' : '50.00'}
                        error={validationErrors.amount}
                        required
                        rightIcon={formData.discount_type === 'percent' ? Percent : DollarSign}
                        autoComplete="off"
                    />
                </div>
            </div>

            <div>
                <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                    <InfoTooltip 
                        text={t('descriptionTooltip') || 'הערה פנימית על הקופון הזה. התיאור הזה נראה רק לך ולצוות שלך, לא ללקוחות.'} 
                        isRTL={isRTL}
                    />
                    <label htmlFor="coupon-description" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('description') || 'תיאור'}
                    </label>
                </div>
                <textarea
                    id="coupon-description"
                    name="description"
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="input-field"
                    rows="3"
                    placeholder={t('couponDescription') || 'תיאור פנימי (לא נראה ללקוחות)'}
                />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('freeShippingTooltip') || 'כאשר מופעל, הקופון הזה יאפשר משלוח חינם ללקוח. זה עוקף כל עלויות משלוח.'} 
                            isRTL={isRTL}
                        />
                        <label className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('allowFreeShipping') || 'אפשר משלוח חינם'}
                        </label>
                    </div>
                    <div className={`flex items-center gap-2 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors cursor-pointer ${isRTL ? 'flex-row-reverse' : 'flex-row'}`} onClick={() => setFormData({ ...formData, free_shipping: !formData.free_shipping })}>
                        <input
                            type="checkbox"
                            id="free_shipping"
                            name="free_shipping"
                            checked={formData.free_shipping}
                            onChange={(e) => setFormData({ ...formData, free_shipping: e.target.checked })}
                            className="w-4 h-4 text-primary-500 rounded"
                        />
                        <label htmlFor="free_shipping" className={`text-sm text-gray-700 cursor-pointer flex-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('enableFreeShipping') || 'אפשר משלוח חינם'}
                        </label>
                    </div>
                </div>

                <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('expiryDateTooltip') || 'הגדר את התאריך שבו הקופון הזה יפוג. השאר ריק אם הקופון לא אמור לפוג.'} 
                            isRTL={isRTL}
                        />
                        <label htmlFor="coupon-expiry-date" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('expiryDate') || 'תאריך תפוגה'}
                        </label>
                    </div>
                    <Input
                        id="coupon-expiry-date"
                        name="date_expires"
                        label=""
                        type="date"
                        value={formData.date_expires}
                        onChange={(e) => setFormData({ ...formData, date_expires: e.target.value })}
                        leftIcon={CalendarIcon}
                    />
                </div>
            </div>
        </div>
    );
};

export default GeneralSettingsStep;
