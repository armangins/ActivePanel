import React from 'react';
import { Modal, Row, Col, Button, Divider, Grid } from 'antd';
import { EditOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { VariationsGrid } from './VariationsGrid';
import { ProductImageGallery } from './ProductImageGallery';
import { ProductInfo } from './ProductInfo';
import { useProductVariations } from '../../hooks/useProductVariations';
import './ProductDetailModal.css';

interface ProductDetailModalProps {
    product: any;
    open: boolean;
    onClose: () => void;
    onEdit: (product: any) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, open, onClose, onEdit }) => {
    const { t } = useLanguage();
    const screens = Grid.useBreakpoint();
    const { variations, loading: loadingVariations } = useProductVariations(product);

    if (!product) return null;

    return (
        <Modal
            open={open}
            onCancel={onClose}
            width={1000}
            footer={[
                <Button key="close" onClick={onClose} size={screens.xs ? 'small' : 'large'}>
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
                    size={screens.xs ? 'small' : 'large'}
                >
                    {t('editProduct')}
                </Button>
            ]}
            centered
            className="product-detail-modal"
        >
            <Row gutter={screens.md ? [32, 32] : [16, 16]}>
                {/* Left Column: Media */}
                <Col xs={24} md={14}>
                    <ProductImageGallery product={product} />
                </Col>

                {/* Right Column: Details */}
                <Col xs={24} md={10}>
                    <ProductInfo product={product} />
                </Col>
            </Row>

            {/* Variations Grid (Full Width below specific details) */}
            {product.type === 'variable' && (
                <>
                    <Divider orientation="right" className="product-variations-divider">
                        {t('variations')} ({variations.length})
                    </Divider>

                    <VariationsGrid
                        variations={variations}
                        loading={loadingVariations}
                        currency={product.currency}
                        parentName={product.name}
                    />
                </>
            )}
        </Modal>
    );
};
