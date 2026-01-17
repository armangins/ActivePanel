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
    product?: Product | null;
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

    // Fetch full product details only if we have a product ID (Edit Mode)
    const { data: fullProduct } = useProductDetail(product?.id || null);

    // Fetch variations if product is variable
    const { data: variationsData, isLoading: isLoadingVariations } = useVariations(product?.id as any);

    // Default values for NEW product
    const defaultValues: Partial<ProductFormValues> = {
        type: 'simple',
        status: 'publish',
        stock_status: 'instock',
        manage_stock: false,
        virtual: false,
        downloadable: false,
        variations: [],
        images: [],
        attributes: []
        // Add other defaults as needed
    };

    // Initialize form
    const methods = useForm<ProductFormValues>({
        defaultValues: product ? { ...product, variations: [] } as unknown as ProductFormValues : defaultValues as ProductFormValues
    });

    const { handleSubmit, reset, control, formState: { isDirty } } = methods;

    // Watch product type to update UI dynamically
    const productType = useWatch({ control, name: 'type' }) || 'simple';

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
        if (open) {
            if (product) {
                // Edit Mode
                const productData = fullProduct || product;
                // Only reset if we are switching products or just opened
                reset({ ...productData, variations: [] } as unknown as ProductFormValues);
            } else {
                // Create Mode -> Reset to defaults
                reset(defaultValues as ProductFormValues);
            }
        }
    }, [product, fullProduct, open, reset]);

    // Populate variations when loaded using reset to sync with useFieldArray
    useEffect(() => {
        if (product?.type === 'variable' && variationsData && !isLoadingVariations) {
            console.log('ProductDetailModal: Setting variations', variationsData);
            reset({
                ...methods.getValues(),
                variations: variationsData
            } as unknown as ProductFormValues);
        }
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

    // removed: if (!product) return null; -> Now we render even if !product (Create Mode)

    const modalTitle = product ? t('editProduct') : t('addNewProduct');

    return (
        <Modal
            open={open}
            onCancel={handleCancel}
            width={1000}
            title={modalTitle}
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
                                    {/* DEBUG: Log product type and variations count */}
                                    {console.log('RENDER: Product Type:', productType, 'Variations:', methods.getValues('variations')?.length)}
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
                        product={product || undefined}
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
                    onAdd={handleManualAdd as any}
                    globalAttributes={globalAttributes}
                    initialValues={editingVariationIndex !== null ? methods.getValues(`variations.${editingVariationIndex}` as any) : undefined}
                    isEditing={editingVariationIndex !== null}
                    parentName={product?.name}
                    parentSku={parentSku}
                    parentManageStock={parentManageStock}
                    parentStockQuantity={parentStockQuantity}
                    existingAttributes={currentAttributes}
                />
            )}
        </Modal>
    );
};

