import React, { useState, useEffect } from 'react';
import { Modal, Row, Col, Image, Typography, Tag, Space, Button, Divider } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { PriceDisplay } from '../ProductList/PriceDisplay';

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

    // Reset selected image when product changes
    useEffect(() => {
        if (product && product.images && product.images.length > 0) {
            setSelectedImage(product.images[0].src);
        } else {
            setSelectedImage(null);
        }
    }, [product]);

    if (!product) return null;

    const hasImages = product.images && product.images.length > 0;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={900}
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
        >
            <Row gutter={[24, 24]}>
                {/* Left Column: Media */}
                <Col xs={24} md={12}>
                    <div style={{ marginBottom: 16, textAlign: 'center', backgroundColor: '#fafafa', borderRadius: 8, padding: 8, minHeight: 300, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                        {hasImages ? (
                            <Image
                                src={selectedImage || product.images[0].src}
                                alt={product.name}
                                style={{ maxHeight: 400, width: '100%', objectFit: 'contain' }}
                            />
                        ) : (
                            <div style={{ fontSize: 48 }}>📦</div>
                        )}
                    </div>

                    {/* Thumbnails */}
                    {hasImages && product.images.length > 1 && (
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
                                            width: 60,
                                            height: 60,
                                            display: 'flex', // center content
                                            alignItems: 'center',
                                            justifyContent: 'center'
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
                <Col xs={24} md={12}>
                    <Title level={3} style={{ marginBottom: 8 }}>{product.name}</Title>

                    <Space direction="vertical" size="small" style={{ width: '100%' }}>
                        <Space split={<Divider type="vertical" />}>
                            {product.sku && <Text type="secondary">SKU: {product.sku}</Text>}
                            <Tag color={product.stock_status === 'instock' ? 'success' : 'error'}>
                                {product.stock_status === 'instock' ? t('inStock') : t('outOfStock')}
                            </Tag>
                            {product.stock_quantity !== undefined && product.stock_quantity !== null && (
                                <Text type="secondary">{t('stockQuantity')}: {product.stock_quantity}</Text>
                            )}
                        </Space>

                        <div style={{ marginTop: 16, marginBottom: 16 }}>
                            <PriceDisplay
                                price={product.price}
                                regular_price={product.regular_price}
                                sale_price={product.sale_price}
                                price_html={product.price_html}
                                currency={product.currency}
                                type={product.type}
                            />
                        </div>

                        {product.categories && product.categories.length > 0 && (
                            <div style={{ marginBottom: 16 }}>
                                <Text strong style={{ display: 'block', marginBottom: 4 }}>{t('categories')}:</Text>
                                <Space size={[0, 8]} wrap>
                                    {product.categories.map((cat: any) => (
                                        <Tag key={cat.id}>{cat.name}</Tag>
                                    ))}
                                </Space>
                            </div>
                        )}

                        {product.description && (
                            <div>
                                <Divider style={{ margin: '12px 0' }} />
                                <Text strong>{t('description')}</Text>
                                <div
                                    style={{ marginTop: 8, maxHeight: 200, overflowY: 'auto' }}
                                    dangerouslySetInnerHTML={{ __html: product.description }}
                                />
                            </div>
                        )}
                    </Space>
                </Col>
            </Row>
        </Modal>
    );
};
