import React from 'react';
import { Row, Col, Card, Empty, Spin } from 'antd';
import { ShoppingOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriceDisplay } from '../ProductList/PriceDisplay';

interface VariationsGridProps {
    variations: any[];
    loading: boolean;
    currency: string;
    parentName?: string; // Parent product name for fallback
}

export const VariationsGrid: React.FC<VariationsGridProps> = ({ variations, loading, currency, parentName }) => {
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
                                <div className="variation-card-image">
                                    {varImg ? (
                                        <img alt={variation.sku} src={varImg} />
                                    ) : (
                                        <ShoppingOutlined className="variation-empty-icon" />
                                    )}
                                </div>
                            }
                        >
                            <Card.Meta
                                title={
                                    <div style={{ fontSize: '12px', whiteSpace: 'normal', lineHeight: '1.2' }}>
                                        {variation.attributes?.length > 0
                                            ? variation.attributes.map((attr: any) => `${attr.option}`).join(', ')
                                            : (parentName || `ID: ${variation.id}`)}
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
