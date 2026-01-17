import React, { useState } from 'react';
import { Card, Form, InputNumber, Row, Col, Typography, theme, Button } from 'antd';
import { Controller, Control, useWatch, useFormContext } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { SmartPricingModal } from '../../components/ProductForm/SmartPricingModal';

const { Text, Link } = Typography;

interface DetailsPricingProps {
    control: Control<ProductFormValues>;
    productType?: string;
    onOpenVariationModal: () => void;
}

export const DetailsPricing: React.FC<DetailsPricingProps> = ({ control, productType, onOpenVariationModal }) => {
    const { t } = useLanguage();
    const { token } = theme.useToken();
    const { setValue } = useFormContext<ProductFormValues>();
    const [showSmartPricing, setShowSmartPricing] = useState(false);



    // Watch fields for profit calc
    const regularPrice = useWatch({ control, name: 'regular_price' });
    const salePrice = useWatch({ control, name: 'sale_price' });

    const effectivePrice = salePrice ? Number(salePrice) : Number(regularPrice);
    const cost = 45.00; // Hardcoded example cost since we don't have it in schema

    const profit = effectivePrice ? (effectivePrice - cost).toFixed(2) : '-';
    // Margin = (Price - Cost) / Price
    const margin = effectivePrice ? ((effectivePrice - cost) / effectivePrice * 100).toFixed(0) + '%' : '-';

    const handleApplySmartPrice = (price: number) => {
        setValue('regular_price', price.toString());
        setShowSmartPricing(false);
    };

    return (
        <>
            <Card title={t('pricing') || 'Pricing'} variant="borderless" className="details-card">
                {productType === 'variable' ? (
                    <div style={{ textAlign: 'center', padding: '24px 0', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 16 }}>

                        <Text type="secondary" style={{ textAlign: 'center' }}>
                            תחילה יש ליצור וריאציות ואחר מכן להגדיר מחיר
                        </Text>
                        <Button type="primary" onClick={onOpenVariationModal}>
                            {t('createVariations') || 'צור וריאציות'}
                        </Button>
                    </div>
                ) : (
                    <>
                        <Row gutter={16}>
                            <Col span={12}>
                                <Form.Item label={t('regularPrice') || 'Regular Price'}>
                                    <Controller
                                        name="regular_price"
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                style={{ width: '100%' }}
                                                prefix="₪"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                            <Col span={12}>
                                <Form.Item label={t('salePrice') || 'Sale Price'}>
                                    <Controller
                                        name="sale_price"
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                style={{ width: '100%' }}
                                                prefix="₪"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            </Col>
                        </Row>

                        <div style={{ marginTop: 16 }}>
                            <Form.Item label={t('stockQuantity') || 'Stock Quantity'}>
                                <Controller
                                    name="stock_quantity"
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            style={{ width: '100%' }}
                                            min={0}
                                        />
                                    )}
                                />
                            </Form.Item>
                        </div>



                        <div style={{ display: 'flex', justifyContent: 'space-between', color: '#666', fontSize: 13, marginBottom: 16 }}>
                            <span>{t('margin') || 'Margin'}: {margin}</span>
                            <span>{t('profit') || 'Profit'}: ₪{profit}</span>
                        </div>

                        <div style={{
                            borderTop: `1px solid ${token.colorBorderSecondary}`,
                            paddingTop: 12,
                            marginTop: 8,
                            fontSize: 13
                        }}>
                            <Text type="secondary">{t('wantToKnowIfProfitable') || 'Want to know if the price is profitable?'} </Text>
                            <Link onClick={() => setShowSmartPricing(true)}>
                                {t('smartPricingCalc') || 'Smart Pricing Calc'}
                            </Link>
                        </div>
                    </>
                )}
            </Card>

            <SmartPricingModal
                visible={showSmartPricing}
                onClose={() => setShowSmartPricing(false)}
                onApplyPrice={handleApplySmartPrice}
            />
        </>
    );
};
