import React, { useState, useRef, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { Input } from '../../ui/inputs';
import { InfoCircleOutlined as InformationCircleIcon } from '@ant-design/icons';
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

const UsageLimitsStep = ({ formData, setFormData, t, validationErrors }) => {
    const { isRTL } = useLanguage();
    
    return (
        <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('usageLimitPerCouponTooltip') || 'הגדר את מספר הפעמים המקסימלי שהקופון הזה יכול לשמש בסך הכל בכל הלקוחות. השאר ריק לשימוש בלתי מוגבל.'} 
                            isRTL={isRTL}
                        />
                        <label htmlFor="usage-limit" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('usageLimitPerCoupon') || 'מגבלת שימוש לקופון'}
                        </label>
                    </div>
                    <Input
                        id="usage-limit"
                        name="usage_limit"
                        label=""
                        type="number"
                        min="0"
                        value={formData.usage_limit}
                        onChange={(e) => setFormData({ ...formData, usage_limit: e.target.value })}
                        placeholder={t('unlimited') || 'Unlimited'}
                        error={validationErrors?.usage_limit}
                        autoComplete="off"
                    />
                    <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('usageLimitPerCouponDesc') || 'Leave empty for unlimited uses'}
                    </p>
                </div>

                <div>
                    <div className={`flex items-center gap-2 mb-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
                        <InfoTooltip 
                            text={t('usageLimitPerUserTooltip') || 'הגדר את מספר הפעמים המקסימלי שלקוח יחיד יכול להשתמש בקופון הזה. השאר ריק לשימוש בלתי מוגבל לכל לקוח.'} 
                            isRTL={isRTL}
                        />
                        <label htmlFor="usage-limit-per-user" className={`block text-sm font-medium text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                            {t('usageLimitPerUser') || 'מגבלת שימוש לכל לקוח'}
                        </label>
                    </div>
                    <Input
                        id="usage-limit-per-user"
                        name="usage_limit_per_user"
                        label=""
                        type="number"
                        min="0"
                        value={formData.usage_limit_per_user}
                        onChange={(e) => setFormData({ ...formData, usage_limit_per_user: e.target.value })}
                        placeholder={t('unlimited') || 'Unlimited'}
                        error={validationErrors?.usage_limit_per_user}
                        autoComplete="off"
                    />
                    <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
                        {t('usageLimitPerUserDesc') || 'Leave empty for unlimited uses per user'}
                    </p>
                </div>
            </div>
        </div>
    );
};

export default UsageLimitsStep;
