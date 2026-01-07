import React from 'react';
import { Typography, Tag, Space, Divider } from 'antd';
import DOMPurify from 'dompurify';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriceDisplay } from '../ProductList/PriceDisplay';
import './ProductDetailModal.css';

const { Title, Text } = Typography;

interface ProductInfoProps {
    product: any;
}

export const ProductInfo: React.FC<ProductInfoProps> = ({ product }) => {
    const { t } = useLanguage();

    // Helper to sanitize HTML content
    const sanitizeHtml = (html: string) => ({
        __html: DOMPurify.sanitize(html)
    });

    return (
        <Space direction="vertical" size="middle" className="product-info-container">
            {/* 1. Title */}
            <Title level={2} className="product-modal-title">{product.name}</Title>

            {/* SKU */}
            {product.sku && <Text type="secondary" copyable>SKU: {product.sku}</Text>}

            <Divider className="product-info-divider" />

            {/* 3. Price & Basic Info */}
            <div className="product-price-row">
                <div className="product-price-wrapper">
                    <PriceDisplay
                        price={product.price}
                        regular_price={product.regular_price}
                        sale_price={product.sale_price}
                        price_html={product.price_html}
                        currency={product.currency}
                        type={product.type}
                        sale_end_date={product.date_on_sale_to}
                    />
                </div>
                <Tag color={product.stock_status === 'instock' ? 'success' : 'error'} className="product-stock-tag">
                    {product.stock_status === 'instock' ? t('inStock') : t('outOfStock')}
                </Tag>
            </div>

            {/* 3. Short Description */}
            {product.short_description ? (
                <div
                    className="product-short-description"
                    dangerouslySetInnerHTML={sanitizeHtml(product.short_description)}
                />
            ) : (
                <Text type="secondary" italic>{t('noShortDescription')}</Text>
            )}

            <Divider className="product-info-divider" />

            {/* 4. Categories */}
            {product.categories && product.categories.length > 0 && (
                <div className="product-categories-wrapper">
                    <Text type="secondary" className="product-categories-label">{t('categories')}:</Text>
                    <Space size={[0, 8]} wrap>
                        {product.categories.map((cat: any) => (
                            <Tag key={cat.id}>{cat.name}</Tag>
                        ))}
                    </Space>
                </div>
            )}
        </Space>
    );
};
