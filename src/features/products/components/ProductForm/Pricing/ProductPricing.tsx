import React, { useState } from 'react';
import { Form, Input, Row, Col, Tooltip, theme } from 'antd';
import { Controller, Control, FieldErrors, UseFormSetValue } from 'react-hook-form';
import { CalculatorOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '@/features/products/types/schemas';
import { SmartPricingModal } from '../SmartPricingModal/index';
import { SalePriceDiscount } from './SalePriceDiscount';
import { SaleSchedule, SaleScheduleDisplay } from './SaleSchedule';

interface ProductPricingProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    setValue: UseFormSetValue<ProductFormValues>;
    productType?: string;
}

export const ProductPricing: React.FC<ProductPricingProps> = ({ control, errors, setValue, productType }) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();
    const [isPricingModalVisible, setIsPricingModalVisible] = useState(false);
    const [isSalePriceFocused, setIsSalePriceFocused] = useState(false);
    const [isRegularPriceFocused, setIsRegularPriceFocused] = useState(false);

    const handleApplyPrice = (price: number) => {
        setValue('regular_price', price.toString(), { shouldValidate: true, shouldDirty: true });
    };

    return (
        <>
            <Row gutter={[16, 16]}>
                <Col xs={24} md={12}>
                    <Form.Item
                        label={t('regularPrice')}
                        validateStatus={errors.regular_price ? 'error' : ''}
                        help={errors.regular_price?.message}
                    >
                        <Controller
                            name="regular_price"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    prefix="₪"
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
                                                borderRadius: token.borderRadius,
                                                cursor: 'pointer',
                                                transition: 'all 0.2s',
                                                backgroundColor: isPricingModalVisible ? token.colorPrimaryBg : 'transparent',
                                                boxShadow: isRegularPriceFocused && !isPricingModalVisible ? `0 0 0 2px ${token.colorPrimaryBg}` : 'none'
                                            }}
                                            onMouseEnter={(e) => {
                                                e.currentTarget.style.backgroundColor = token.colorPrimaryBg;
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
                                                    style={{ color: token.colorPrimary, fontSize: 16 }}
                                                />
                                            </Tooltip>
                                        </div>
                                    }
                                />
                            )}
                        />
                    </Form.Item>
                </Col>
                <Col xs={24} md={12}>
                    <Form.Item label={t('salePrice')}>
                        <Controller
                            name="sale_price"
                            control={control}
                            render={({ field }) => (
                                <div>
                                    <Input
                                        {...field}
                                        prefix="₪"
                                        onFocus={() => setIsSalePriceFocused(true)}
                                        onBlur={() => setIsSalePriceFocused(false)}
                                        suffix={
                                            <div style={{ display: 'flex', gap: 8 }}>
                                                <SalePriceDiscount
                                                    control={control}
                                                    setValue={setValue}
                                                    isFocused={isSalePriceFocused}
                                                />

                                                {productType !== 'variable' && (
                                                    <SaleSchedule
                                                        control={control}
                                                        setValue={setValue}
                                                        isFocused={isSalePriceFocused}
                                                    />
                                                )}
                                            </div>
                                        }
                                    />
                                    {productType !== 'variable' && (
                                        <SaleScheduleDisplay control={control} />
                                    )}
                                </div>
                            )}
                        />
                    </Form.Item>
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

