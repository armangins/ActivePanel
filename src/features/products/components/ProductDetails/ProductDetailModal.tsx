
import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Image, Typography, Tag, Space, Button, Divider } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriceDisplay } from '../ProductList/PriceDisplay';
import { productsService } from '../../api/products.service';
import DOMPurify from 'dompurify';
import { VariationsGrid } from './VariationsGrid';

const { Title, Text } = Typography;

interface ProductDetailModalProps {
    product: any;
    open: boolean;
    onClose: () => void;
    onEdit: (product: any) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, open, onClose, onEdit }) => {
    const { t } = useLanguage();
    const [selectedImage, setSelectedImage] = useState<string | null>(null);
    const [variations, setVariations] = useState<any[]>([]);
    const [loadingVariations, setLoadingVariations] = useState(false);

    // Reset state when product changes
    useEffect(() => {
        if (product) {
            if (product.images && product.images.length > 0) {
                setSelectedImage(product.images[0].src);
            } else {
                setSelectedImage(null);
            }

            // Fetch variations if variable product
            if (product.type === 'variable') {
                setLoadingVariations(true);
                productsService.getVariations(product.id)
                    .then(data => setVariations(data))
                    .catch(err => console.error('Failed to fetch variations', err))
                    .finally(() => setLoadingVariations(false));
            } else {
                setVariations([]);
            }
        }
    }, [product]);

    if (!product) return null;

    const hasImages = product.images && product.images.length > 0;
    const hasThumbnails = hasImages && product.images.length > 1;

    // Helper to sanitize HTML content
    const sanitizeHtml = (html: string) => ({
        __html: DOMPurify.sanitize(html)
    });

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose}>
                    {t('close')}
                </Button>,
                <Button
                    key="edit"
                    type="primary"
                    icon={<EditOutlined />}
                    onClick={() => {
                        onEdit(product);
                        onClose();
                    }}
                >
                    {t('editProduct')}
                </Button>
            ]}
            centered
            className="product-detail-modal"
        >
            <Row gutter={[32, 32]}>
                {/* Left Column: Media */}
                <Col xs={24} md={14}>
                    <div style={{
                        marginBottom: 16,
                        textAlign: 'center',
                        backgroundColor: '#fafafa',
                        borderRadius: 8,
                        padding: 0,
                        minHeight: 300,
                        height: hasThumbnails ? 400 : 500, // Expand if no thumbnails
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        overflow: 'hidden'
                    }}>
                        {hasImages ? (
                            <Image
                                src={selectedImage || product.images[0].src}
                                alt={product.name}
                                style={{ maxHeight: '100%', maxWidth: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{ fontSize: 48 }}></div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {hasThumbnails && (
                        <div style={{ overflowX: 'auto', whiteSpace: 'nowrap', paddingBottom: 8 }}>
                            <Space size={8}>
                                {product.images.map((img: any, index: number) => (
                                    <div
                                        key={index}
                                        style={{
                                            border: selectedImage === img.src ? '2px solid #1890ff' : '1px solid #d9d9d9',
                                            borderRadius: 4,
                                            padding: 2,
                                            cursor: 'pointer',
                                            width: 70,
                                            height: 70,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            backgroundColor: '#fff'
                                        }}
                                        onClick={() => setSelectedImage(img.src)}
                                    >
                                        <img
                                            src={img.src}
                                            alt={`thumbnail-${index}`}
                                            style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain' }}
                                        />
                                    </div>
                                ))}
                            </Space>
                        </div>
                    )}
                </Col>

                {/* Right Column: Details */}
                <Col xs={24} md={10}>
                    <Space direction="vertical" size="middle" style={{ width: '100%' }}>

                        {/* 1. Title */}
                        <Title level={2} style={{ marginBottom: 0 }}>{product.name}</Title>

                        {/* SKU */}
                        {product.sku && <Text type="secondary" copyable>SKU: {product.sku}</Text>}


                        <Divider style={{ margin: '12px 0' }} />

                        {/* 3. Price & Basic Info */}
                        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                            <div style={{ fontSize: '24px' }}>
                                <PriceDisplay
                                    price={product.price}
                                    regular_price={product.regular_price}
                                    sale_price={product.sale_price}
                                    price_html={product.price_html}
                                    currency={product.currency}
                                    type={product.type}
                                />
                            </div>
                            <Tag color={product.stock_status === 'instock' ? 'success' : 'error'} style={{ fontSize: '14px', padding: '4px 8px' }}>
                                {product.stock_status === 'instock' ? t('inStock') : t('outOfStock')}
                            </Tag>
                        </div>

                        {/* 3. Short Description */}
                        {product.short_description ? (
                            <div
                                className="product-short-description"
                                style={{ color: '#666', fontSize: '15px' }}
                                dangerouslySetInnerHTML={sanitizeHtml(product.short_description)}
                            />
                        ) : (
                            <Text type="secondary" italic>{t('noShortDescription')}</Text>
                        )}

                        <Divider style={{ margin: '12px 0' }} />


                        {/* 4. Categories */}
                        {product.categories && product.categories.length > 0 && (
                            <div style={{ marginTop: 8 }}>
                                <Text type="secondary" style={{ marginRight: 8 }}>{t('categories')}:</Text>
                                <Space size={[0, 8]} wrap>
                                    {product.categories.map((cat: any) => (
                                        <Tag key={cat.id}>{cat.name}</Tag>
                                    ))}
                                </Space>
                            </div>
                        )}

                    </Space>
                </Col>
            </Row>

            {/* Variations Grid (Full Width below specific details) */}
            {product.type === 'variable' && (
                <>
                    <Divider orientation="right" style={{ marginTop: 32 }}>
                        {t('variations')} ({variations.length})
                    </Divider>

                    <VariationsGrid
                        variations={variations}
                        loading={loadingVariations}
                        currency={product.currency}
                    />
                </>
            )}
        </Modal>
    );
};
