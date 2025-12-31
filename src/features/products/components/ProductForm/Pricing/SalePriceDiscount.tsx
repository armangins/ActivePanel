import React, { useState } from 'react';
import { Popover, Tooltip, theme } from 'antd';
import { PercentageOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { UseFormSetValue, useWatch, Control } from 'react-hook-form';
import { ProductFormValues } from '@/features/products/types/schemas';

interface SalePriceDiscountProps {
    control: Control<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    isFocused: boolean;
}

export const SalePriceDiscount: React.FC<SalePriceDiscountProps> = ({
    control,
    setValue,
    isFocused
}) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();
    const [isVisible, setIsVisible] = useState(false);

    // Watch regular price to calculate discounts
    const regularPriceStr = useWatch({ control, name: 'regular_price' });
    const regularPrice = parseFloat(regularPriceStr || '0');

    const discounts = [10, 20, 30, 40, 50];

    const handleApplyDiscount = (discountPercent: number) => {
        if (regularPrice > 0) {
            const salePrice = regularPrice * (1 - discountPercent / 100);
            setValue('sale_price', salePrice.toFixed(2), { shouldValidate: true });
            setIsVisible(false);
        }
    };

    const content = (
        <div style={{ padding: 8 }}>
            <div style={{ marginBottom: 8, fontWeight: 500, color: token.colorTextHeading }}>
                {t('selectDiscount')}
            </div>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                {discounts.map(discount => {
                    const salePrice = regularPrice * (1 - discount / 100);
                    const isDisabled = regularPrice <= 0;

                    return (
                        <div
                            key={discount}
                            onClick={() => !isDisabled && handleApplyDiscount(discount)}
                            style={{
                                padding: '8px 12px',
                                cursor: isDisabled ? 'not-allowed' : 'pointer',
                                borderRadius: token.borderRadius,
                                border: `1px solid ${token.colorBorder}`,
                                opacity: isDisabled ? 0.5 : 1,
                                transition: 'all 0.2s',
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                backgroundColor: token.colorBgContainer
                            }}
                            onMouseEnter={(e) => {
                                if (!isDisabled) {
                                    e.currentTarget.style.borderColor = token.colorPrimary;
                                    e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
                                }
                            }}
                            onMouseLeave={(e) => {
                                e.currentTarget.style.borderColor = token.colorBorder;
                                e.currentTarget.style.backgroundColor = token.colorBgContainer;
                            }}
                        >
                            <span>{discount}% {t('off')}</span>
                            <span style={{ color: token.colorSuccess, fontWeight: 500 }}>
                                ${salePrice.toFixed(2)}
                            </span>
                        </div>
                    );
                })}
            </div>
        </div>
    );

    return (
        <Popover
            content={content}
            title={t('discount')}
            trigger="click"
            open={isVisible}
            onOpenChange={setIsVisible}
            placement="bottomRight"
        >
            <div
                style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    width: 24,
                    height: 24,
                    borderRadius: token.borderRadius,
                    cursor: 'pointer',
                    transition: 'all 0.2s',
                    backgroundColor: isVisible ? token.colorPrimaryBg : 'transparent',
                    // Using separate style tag in parent for animation to avoid inline keyframes complexity here
                    // or we check if we can live without the pulse for now, or use a CSS class if available.
                    // The previous code had a style tag. We'll rely on the parent or adding a class later?
                    // For now, let's keep the style object clean.
                    // If isFocused is true, we might want to show some highlight.
                    boxShadow: isFocused && !isVisible ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none'
                }}
            >
                <Tooltip title={t('discount')}>
                    <PercentageOutlined
                        style={{
                            color: token.colorPrimary,
                            fontSize: 16
                        }}
                    />
                </Tooltip>
            </div>
        </Popover>
    );
};
