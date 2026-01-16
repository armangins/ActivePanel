import React, { useEffect } from 'react';
import { Modal, Row, Col, Form, Space, theme } from 'antd';
import { useForm, FormProvider, useWatch } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useVariations, useProductDetail } from '@/features/products/hooks/useProductsData';
import { ProductFormValues } from '@/features/products/types/schemas';
import { Product } from '@/features/products/types';
import './ProductDetailModal.css';

// Components
import { DetailsBasicInfo } from '../DetailsBasicInfo';
import { DetailsMedia } from '../DetailsMedia';
import { DetailsVariations } from '../DetailsVariations/DetailsVariations';
import { DetailsOrganization } from '../DetailsOrganization';
import { DetailsPricing } from '../DetailsPricing';
import { ProductDetailFooter } from '../ProductDetailFooter';

// Hooks
import { useProductSave } from '@/features/products/hooks/useProductSave';
import { useAttributes } from '@/hooks/useAttributes';
import { useManualVariation } from '@/features/products/hooks/useManualVariation';
import { AddVariationModal } from '../../ProductForm/Variations/AddVariationModal';

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

    // Variation Modal State
    const [isVariationModalOpen, setIsVariationModalOpen] = React.useState(false);
    const [editingVariationIndex, setEditingVariationIndex] = React.useState<number | null>(null);

    const { data: globalAttributes = [] } = useAttributes();

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

    // Watch product type to update UI dynamically
    const productType = useWatch({ control, name: 'type' }) || product?.type;

    const { handleSave, isSaving } = useProductSave({ product, onClose });

    // Custom hook for manual variation logic
    const { handleManualAdd } = useManualVariation(methods, editingVariationIndex, setEditingVariationIndex);

    const handleOpenVariationModal = () => setIsVariationModalOpen(true);
    const parentSku = useWatch({ control, name: 'sku' });
    const parentManageStock = useWatch({ control, name: 'manage_stock' });
    const parentStockQuantity = useWatch({ control, name: 'stock_quantity' }) ?? undefined;
    const currentAttributes = useWatch({ control, name: 'attributes' });

    // Reset form when product changes
    useEffect(() => {
        if (product && open) {
            reset({ ...product, variations: [] } as unknown as ProductFormValues);
        }
    }, [product, open, reset]);

    // Populate variations when loaded using reset to sync with useFieldArray
    useEffect(() => {

    }, [variationsData, isLoadingVariations, product?.type, reset, methods]);

    const handleCancel = () => {
        if (isDirty) {
            Modal.confirm({
                title: t('unsavedChangesWarning') || 'יש שינויים שלא נשמרו. האם לצאת?',
                okText: t('yes') || 'כן',
                cancelText: t('no') || 'לא',
                onOk: () => onClose(),
            });
        } else {
            onClose();
        }
    };

    if (!product) return null;

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            width={1000}
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
                                    {productType === 'variable' && (
                                        <DetailsVariations control={control} onOpenVariationModal={handleOpenVariationModal} />
                                    )}
                                </Space>
                            </Col>

                            {/* Sidebar (Right) */}
                            <Col xs={24} lg={8}>
                                <div className="sticky-sidebar">
                                    <Space direction="vertical" size="large" style={{ width: '100%' }}>
                                        <DetailsOrganization control={control} />
                                        <DetailsPricing control={control} productType={productType} onOpenVariationModal={handleOpenVariationModal} />
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

            {isVariationModalOpen && (
                <AddVariationModal
                    visible={isVariationModalOpen}
                    onCancel={() => {
                        setIsVariationModalOpen(false);
                        setEditingVariationIndex(null);
                    }}
                    onAdd={handleManualAdd}
                    globalAttributes={globalAttributes}
                    initialValues={editingVariationIndex !== null ? methods.getValues(`variations.${editingVariationIndex}` as any) : undefined}
                    isEditing={editingVariationIndex !== null}
                    parentSku={parentSku}
                    parentManageStock={parentManageStock}
                    parentStockQuantity={parentStockQuantity}
                    existingAttributes={currentAttributes}
                />
            )}
        </Modal>
    );
};

