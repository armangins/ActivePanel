import React, { useEffect } from 'react';
import { Modal, Row, Col, Form, Space, theme } from 'antd';
import { useForm, FormProvider } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVariations, useProductDetail } from '@/features/products/hooks/useProductsData';
import { ProductFormValues } from '@/features/products/types/schemas';
import { Product } from '@/features/products/types';
import './ProductDetailModal.css';

// Components
import { DetailsBasicInfo } from './DetailsBasicInfo';
import { DetailsMedia } from './DetailsMedia';
import { DetailsVariations } from './DetailsVariations';
import { DetailsOrganization } from './DetailsOrganization';
import { DetailsPricing } from './DetailsPricing';
import { ProductDetailFooter } from './ProductDetailFooter';

// Hooks
import { useProductSave } from '@/features/products/hooks/useProductSave';

interface ProductDetailModalProps {
    product: Product;
    open: boolean;
    onClose: () => void;
    onEdit?: (product: Product) => void;
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, open, onClose }) => {
    const { t } = useLanguage();
    const { useToken } = theme;
    const { token } = useToken();

    // Fetch full product details to ensure we have permalink and latest data
    const { data: fullProduct } = useProductDetail(product?.id);

    // Fetch variations if product is variable
    const { data: variationsData, isLoading: isLoadingVariations } = useVariations(product?.id);

    // Initialize form with product data, but reset variations to empty array initially
    // to avoid type conflict (Product.variations is number[], ProductFormValues.variations is Object[])
    // The actual variation objects will be populated by the useEffect below once fetched.
    const methods = useForm<ProductFormValues>({
        defaultValues: product ? { ...product, variations: [] } as unknown as ProductFormValues : {}
    });

    const { handleSubmit, reset, control, formState: { isDirty } } = methods;

    const { handleSave, isSaving } = useProductSave({ product, onClose });

    // Reset form when product changes
    useEffect(() => {
        if (product && open) {
            reset({ ...product, variations: [] } as unknown as ProductFormValues);
        }
    }, [product, open, reset]);

    // Populate variations when loaded using reset to sync with useFieldArray
    useEffect(() => {

    }, [variationsData, isLoadingVariations, product?.type, reset, methods]);

    if (!product) return null;

    return (
        <Modal
            open={open}
            onCancel={() => {
                if (isDirty) {
                    if (window.confirm(t('unsavedChangesWarning') || 'יש שינויים שלא נשמרו. האם לצאת?')) {
                        onClose();
                    }
                } else {
                    onClose();
                }
            }}
            width={1200}
            title={t('editProduct')}
            footer={null}
            centered
            className="product-detail-modal"
            styles={{ body: { padding: 0, overflow: 'hidden' } }}
        >
            <FormProvider {...methods}>
                <Form layout="vertical" component="div" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>

                    {/* Scrollable Content Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: token.colorBgLayout }}>
                        <Row gutter={[24, 24]} style={{ alignItems: 'stretch' }}>
                            {/* Main Content (Left) */}
                            <Col xs={24} lg={16}>
                                <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                    <DetailsBasicInfo control={control} />
                                    <DetailsMedia control={control} />
                                    {product.type === 'variable' && (
                                        <DetailsVariations control={control} />
                                    )}
                                </Space>
                            </Col>

                            {/* Sidebar (Right) */}
                            <Col xs={24} lg={8}>
                                <div className="sticky-sidebar">
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <DetailsOrganization control={control} />
                                        <DetailsPricing control={control} productType={product.type} />
                                    </Space>
                                </div>
                            </Col>
                        </Row>
                    </div>

                    {/* Extracted Footer */}
                    <ProductDetailFooter
                        onClose={onClose}
                        onSave={handleSubmit(handleSave)}
                        isSaving={isSaving}
                        product={product}
                        fullProduct={fullProduct}
                    />
                </Form>
            </FormProvider>
        </Modal>
    );
};

