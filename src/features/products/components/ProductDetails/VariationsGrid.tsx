import React from 'react';
import { Row, Col, Card, Empty, Spin } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriceDisplay } from '../ProductList/PriceDisplay';

interface VariationsGridProps {
    variations: any[];
    loading: boolean;
    currency: string;
}

export const VariationsGrid: React.FC<VariationsGridProps> = ({ variations, loading, currency }) => {
    const { t } = useLanguage();

    if (loading) {
        return (
            <div style={{ textAlign: 'center', padding: '40px' }}>
                <Spin size="large" tip={t('loadingVariations')} />
            </div>
        );
    }

    if (!variations || variations.length === 0) {
        return <Empty description={t('noVariationsFound')} />;
    }

    return (
        <Row gutter={[16, 16]} style={{ direction: 'rtl' }}>
            {variations.map((variation) => {
                const varImg = variation.image?.src;
                return (
                    <Col xs={12} sm={8} md={6} lg={4} key={variation.id}>
                        <Card
                            hoverable
                            size="small"
                            cover={
                                <div style={{

                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    backgroundColor: '#f5f5f5',
                                    borderBottom: '1px solid #f0f0f0'
                                }}>
                                    {varImg ? (
                                        <img alt={variation.sku} src={varImg} style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }} />
                                    ) : (
                                        <ShoppingOutlined style={{ fontSize: 32, color: '#d9d9d9' }} />
                                    )}
                                </div>
                            }
                        >
                            <Card.Meta
                                title={
                                    <div style={{ fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                        {variation.attributes?.map((mockAttr: any) => `${mockAttr.option}`).join(', ') || `ID: ${variation.id}`}
                                    </div>
                                }
                                description={
                                    <div style={{ marginTop: 4 }}>
                                        <PriceDisplay
                                            price={variation.price}
                                            regular_price={variation.regular_price}
                                            sale_price={variation.sale_price}
                                            currency={currency}
                                        />
                                        {variation.stock_quantity !== null && (
                                            <div style={{ fontSize: '11px', color: '#999', marginTop: 2 }}>
                                                {t('stock')}: {variation.stock_quantity}
                                            </div>
                                        )}
                                    </div>
                                }
                            />
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};
