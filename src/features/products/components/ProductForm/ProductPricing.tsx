import React, { useState, useEffect } from 'react';
import { Form, Input, Row, Col, Tooltip, DatePicker, Popover } from 'antd';
import { Controller, Control, FieldErrors, UseFormSetValue, useWatch } from 'react-hook-form';
import { CalculatorOutlined, CalendarOutlined, PercentageOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { SmartPricingModal } from './SmartPricingModal';
import dayjs from 'dayjs';

interface ProductPricingProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    productType?: string;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({ control, errors, setValue, productType }) => {
    const { t } = useLanguage();
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isScheduleVisible, setIsScheduleVisible] = useState(false);
    const [isDiscountVisible, setIsDiscountVisible] = useState(false);
    const [isSalePriceFocused, setIsSalePriceFocused] = useState(false);
    const [scheduledDates, setScheduledDates] = useState<{ from: string; to: string } | null>(null);
    const [isRegularPriceFocused, setIsRegularPriceFocused] = useState(false);

    // Watch the form values for scheduled dates to sync with local state
    const dateOnSaleFrom = useWatch({ control, name: 'date_on_sale_from' });
    const dateOnSaleTo = useWatch({ control, name: 'date_on_sale_to' });

    // Sync scheduledDates state with form values (handles form reset)
    useEffect(() => {
        if (dateOnSaleFrom && dateOnSaleTo) {
            setScheduledDates({ from: dateOnSaleFrom, to: dateOnSaleTo });
        } else {
            setScheduledDates(null);
        }
    }, [dateOnSaleFrom, dateOnSaleTo]);

    const handleApplyPrice = (price: number) => {
        setValue('regular_price', price.toString(), { shouldValidate: true, shouldDirty: true });
    };

    // CSS for pulse animation
    const pulseAnimation = `
        @keyframes iconPulse {
            0%, 100% {
                transform: scale(1);
                opacity: 1;
                background-color: transparent;
            }
            50% {
                transform: scale(1.1);
                opacity: 0.9;
                background-color: #e6f7ff;
            }
        }
    `;

    return (
        <>
            <style>{pulseAnimation}</style>
            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item label={t('regularPrice')} validateStatus={errors.regular_price ? 'error' : ''} help={errors.regular_price?.message}>
                        <Controller
                            name="regular_price"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix="$"
                                    onFocus={() => setIsRegularPriceFocused(true)}
                                    onBlur={() => setIsRegularPriceFocused(false)}
                                    suffix={
                                        <div
                                            style={{
                                                display: 'inline-flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                width: 24,
                                                height: 24,
                                                borderRadius: 4,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: isPricingModalVisible ? '#e6f7ff' : 'transparent',
                                                animation: isRegularPriceFocused && !isPricingModalVisible ? 'iconPulse 2s ease-in-out infinite' : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = '#e6f7ff';
                                            }}
                                            onMouseLeave={(e) => {
                                                if (!isPricingModalVisible) {
                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                }
                                            }}
                                            onClick={() => setIsPricingModalVisible(true)}
                                        >
                                            <Tooltip title={t('smartPricing') || "Smart Pricing Tool"}>
                                                <CalculatorOutlined
                                                    style={{ color: '#1890ff', fontSize: 16 }}
                                                />
                                            </Tooltip>
                                        </div>
                                    }
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item label={t('salePrice')}>
                        <Controller
                            name="sale_price"
                            control={control}
                            render={({ field }) => (
                                <Controller
                                    name="regular_price"
                                    control={control}
                                    render={({ field: regularPriceField }) => (
                                        <Input
                                            {...field}
                                            prefix="$"
                                            onFocus={() => setIsSalePriceFocused(true)}
                                            onBlur={() => setIsSalePriceFocused(false)}
                                            suffix={
                                                <div style={{ display: 'flex', gap: 8 }}>
                                                    <Popover
                                                        content={
                                                            <div style={{ padding: 8 }}>
                                                                <div style={{ marginBottom: 8, fontWeight: 500 }}>{t('selectDiscount')}</div>
                                                                <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                                                                    {[10, 20, 30, 40, 50].map(discount => {
                                                                        const regularPrice = parseFloat(regularPriceField.value || '0');
                                                                        const salePrice = regularPrice * (1 - discount / 100);
                                                                        return (
                                                                            <div
                                                                                key={discount}
                                                                                onClick={() => {
                                                                                    if (regularPrice > 0) {
                                                                                        setValue('sale_price', salePrice.toFixed(2), { shouldValidate: true });
                                                                                        setIsDiscountVisible(false);
                                                                                    }
                                                                                }}
                                                                                style={{
                                                                                    padding: '8px 12px',
                                                                                    cursor: regularPrice > 0 ? 'pointer' : 'not-allowed',
                                                                                    borderRadius: 4,
                                                                                    border: '1px solid #d9d9d9',
                                                                                    opacity: regularPrice > 0 ? 1 : 0.5,
                                                                                    transition: 'all 0.2s',
                                                                                    display: 'flex',
                                                                                    justifyContent: 'space-between',
                                                                                    alignItems: 'center'
                                                                                }}
                                                                                onMouseEnter={(e) => {
                                                                                    if (regularPrice > 0) {
                                                                                        e.currentTarget.style.borderColor = '#1890ff';
                                                                                        e.currentTarget.style.backgroundColor = '#f0f5ff';
                                                                                    }
                                                                                }}
                                                                                onMouseLeave={(e) => {
                                                                                    e.currentTarget.style.borderColor = '#d9d9d9';
                                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                                }}
                                                                            >
                                                                                <span>{discount}% {t('off')}</span>
                                                                                <span style={{ color: '#52c41a', fontWeight: 500 }}>
                                                                                    ${salePrice.toFixed(2)}
                                                                                </span>
                                                                            </div>
                                                                        );
                                                                    })}
                                                                </div>
                                                            </div>
                                                        }
                                                        title={t('discount')}
                                                        trigger="click"
                                                        open={isDiscountVisible}
                                                        onOpenChange={setIsDiscountVisible}
                                                        placement="bottomRight"
                                                    >
                                                        <div
                                                            style={{
                                                                display: 'inline-flex',
                                                                alignItems: 'center',
                                                                justifyContent: 'center',
                                                                width: 24,
                                                                height: 24,
                                                                borderRadius: 4,
                                                                cursor: 'pointer',
                                                                transition: 'all 0.2s',
                                                                backgroundColor: isDiscountVisible ? '#e6f7ff' : 'transparent',
                                                                animation: isSalePriceFocused && !isDiscountVisible ? 'iconPulse 2s ease-in-out infinite' : 'none'
                                                            }}
                                                            onMouseEnter={(e) => {
                                                                e.currentTarget.style.backgroundColor = '#e6f7ff';
                                                            }}
                                                            onMouseLeave={(e) => {
                                                                if (!isDiscountVisible) {
                                                                    e.currentTarget.style.backgroundColor = 'transparent';
                                                                }
                                                            }}
                                                        >
                                                            <Tooltip title={t('discount')}>
                                                                <PercentageOutlined
                                                                    style={{
                                                                        color: '#1890ff',
                                                                        fontSize: 16
                                                                    }}
                                                                />
                                                            </Tooltip>
                                                        </div>
                                                    </Popover>
                                                    {productType !== 'variable' && (
                                                        <Popover
                                                            content={
                                                                <div style={{ padding: 8 }}>
                                                                    <DatePicker.RangePicker
                                                                        style={{ width: 280 }}
                                                                        format="YYYY-MM-DD"
                                                                        value={
                                                                            dateOnSaleFrom && dateOnSaleTo
                                                                                ? [
                                                                                    dayjs(dateOnSaleFrom),
                                                                                    dayjs(dateOnSaleTo)
                                                                                ] as any
                                                                                : null
                                                                        }
                                                                        onChange={(dates, dateStrings) => {
                                                                            // Ensure ISO 8601 format for WooCommerce API
                                                                            const fromDate = dateStrings[0] || null;
                                                                            const toDate = dateStrings[1] || null;

                                                                            setValue('date_on_sale_from', fromDate);
                                                                            setValue('date_on_sale_to', toDate);

                                                                            if (fromDate && toDate) {
                                                                                setScheduledDates({ from: fromDate, to: toDate });
                                                                            } else {
                                                                                setScheduledDates(null);
                                                                            }
                                                                        }}
                                                                    />
                                                                </div>
                                                            }
                                                            title={t('scheduleSale')}
                                                            trigger="click"
                                                            open={isScheduleVisible}
                                                            onOpenChange={setIsScheduleVisible}
                                                            placement="bottomRight"
                                                        >
                                                            <div
                                                                style={{
                                                                    display: 'inline-flex',
                                                                    alignItems: 'center',
                                                                    justifyContent: 'center',
                                                                    width: 24,
                                                                    height: 24,
                                                                    borderRadius: 4,
                                                                    cursor: 'pointer',
                                                                    transition: 'all 0.2s',
                                                                    backgroundColor: scheduledDates ? '#f6ffed' : (isScheduleVisible ? '#e6f7ff' : 'transparent'),
                                                                    animation: isSalePriceFocused && !isScheduleVisible && !scheduledDates ? 'iconPulse 2s ease-in-out infinite 0.3s' : 'none'
                                                                }}
                                                                onMouseEnter={(e) => {
                                                                    if (!scheduledDates) {
                                                                        e.currentTarget.style.backgroundColor = '#e6f7ff';
                                                                    }
                                                                }}
                                                                onMouseLeave={(e) => {
                                                                    if (!isScheduleVisible && !scheduledDates) {
                                                                        e.currentTarget.style.backgroundColor = 'transparent';
                                                                    }
                                                                }}
                                                            >
                                                                <Tooltip title={t('scheduleSale')}>
                                                                    <CalendarOutlined
                                                                        style={{
                                                                            color: scheduledDates ? '#52c41a' : '#1890ff',
                                                                            fontSize: 16
                                                                        }}
                                                                    />
                                                                </Tooltip>
                                                            </div>
                                                        </Popover>
                                                    )}
                                                </div>
                                            }
                                        />
                                    )}
                                />
                            )}
                        />
                    </Form.Item>
                    {scheduledDates && (
                        <div style={{
                            marginTop: -16,
                            marginBottom: 16,
                            fontSize: 12,
                            color: '#52c41a',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 4
                        }}>
                            <CalendarOutlined />
                            <span>{scheduledDates.from} - {scheduledDates.to}</span>
                        </div>
                    )}

                </Col>
            </Row>

            <SmartPricingModal
                visible={isPricingModalVisible}
                onClose={() => setIsPricingModalVisible(false)}
                onApplyPrice={handleApplyPrice}
            />
        </>
    );
};
