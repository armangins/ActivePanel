import React, { useEffect } from 'react';
import { Modal, Row, Col, Button, Grid, Form, Space, theme } from 'antd';
import { SaveOutlined, CloseOutlined, GlobalOutlined } from '@ant-design/icons';
import { useForm, FormProvider } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessage } from '@/contexts/MessageContext';
import { useUpdateProduct, useVariations, useBatchVariations, useProductDetail } from '@/features/products/hooks/useProductsData';
import { ProductFormValues } from '@/features/products/types/schemas';
import './ProductDetailModal.css';

// Phase 2 Components
import { DetailsBasicInfo } from './DetailsBasicInfo';
import { DetailsMedia } from './DetailsMedia';
import { DetailsVariations } from './DetailsVariations';
import { DetailsOrganization } from './DetailsOrganization';
import { DetailsPricing } from './DetailsPricing';

interface ProductDetailModalProps {
    product: any;
    open: boolean;
    onClose: () => void;
    onEdit: (product: any) => void; // Keeps the old prop for compat, but we might not need it if we save inline
}

export const ProductDetailModal: React.FC<ProductDetailModalProps> = ({ product, open, onClose }) => {
    const { t } = useLanguage();
    const messageApi = useMessage();
    const screens = Grid.useBreakpoint();
    const updateMutation = useUpdateProduct();

    // Fetch full product details to ensure we have permalink and latest data
    const { data: fullProduct } = useProductDetail(product?.id);

    // Fetch variations if product is variable
    const { data: variationsData, isLoading: isLoadingVariations } = useVariations(product?.id);


    const methods = useForm<ProductFormValues>({
        defaultValues: product || {}
    });

    const { handleSubmit, reset, control, setValue, formState: { isDirty } } = methods;

    // Reset form when product changes
    useEffect(() => {
        if (product && open) {
            console.log('Product Data Debug:', { id: product.id, permalink: product.permalink, name: product.name });
            reset(product);
        }
    }, [product, open, reset]);

    // Populate variations when loaded using reset to sync with useFieldArray
    useEffect(() => {
        if (product?.type === 'variable' && variationsData && !isLoadingVariations) {
            console.log('Variations Debug:', {
                type: product.type,
                variationsCount: variationsData.length,
                variations: variationsData
            });
            // We use reset(values, { keepDefaultValues: true }) to update the form data
            // effectively merging the new variations into the current form state
            // This is required because useFieldArray doesn't always listen to setValue('fieldArray')
            const currentValues = methods.getValues();
            reset({ ...currentValues, variations: variationsData });
        } else {
            console.log('Variations Debug (Skip):', {
                type: product?.type,
                hasVariationsData: !!variationsData,
                isLoading: isLoadingVariations
            });
        }
    }, [variationsData, isLoadingVariations, product?.type, reset]);

    const batchVariationsMutation = useBatchVariations();

    const handleSave = async (data: ProductFormValues) => {
        try {
            // 1. Separate Parent and Variation Data
            // We strip 'attributes' from parentData to avoid 400 errors (missing slug, etc).
            // Attributes are usually managed via their own flow or need strict shaping.
            // If attributes management is needed here, we must map them correctly to ProductAttribute type.
            const { variations, attributes, ...parentData } = data;

            // 2. Update Parent Product
            console.log('Updating Parent Product (Sanitized):', parentData);
            await updateMutation.mutateAsync({ id: product.id, data: parentData });

            // 3. Update Variations (if variable product and variations exist)
            if (product.type === 'variable' && variations && Array.isArray(variations)) {
                console.log('Raw Variations Form Data:', variations); // Check what's coming from the form
                // Prepare batch update payload
                // Currently validation only on 'update' (existing IDs), we can expand to 'create'/'delete' later if needed
                const updateData = variations
                    .filter((v: any) => v.id) // Only update existing variations
                    .map((v: any) => ({
                        id: v.id,
                        regular_price: v.regular_price !== undefined && v.regular_price !== null ? String(v.regular_price) : undefined,
                        sale_price: v.sale_price !== undefined && v.sale_price !== null ? String(v.sale_price) : '',
                        stock_quantity: v.stock_quantity,
                        manage_stock: v.stock_quantity !== undefined && v.stock_quantity !== null ? true : v.manage_stock,
                        // SKU removed - causes duplicate SKU errors when all variations share the same SKU
                        image: v.image instanceof File ? undefined : undefined
                    }));

                console.log('Sending Batch Update Payload:', updateData);

                if (updateData.length > 0) {
                    await batchVariationsMutation.mutateAsync({
                        productId: product.id,
                        data: { update: updateData }
                    });
                }
            }

            messageApi.success(t('productUpdatedSuccessfully') || 'Product updated');
            onClose();
        } catch (error: any) {
            console.error('Save error:', error);
            // Default error message
            let errorMessage = t('errorSavingProduct') || 'Error saving product';

            // Try to extract specific error message from API response
            if (error?.response?.data) {
                const data = error.response.data;
                if (data.message) {
                    errorMessage += `: ${data.message}`;
                }

                // Handle array of specific validation errors
                if (Array.isArray(data.errors) && data.errors.length > 0) {
                    const details = data.errors.map((e: any) => e.message || e.code || JSON.stringify(e)).join(', ');
                    errorMessage += ` (${details})`;
                } else if (data.error && typeof data.error === 'string') {
                    errorMessage += `: ${data.error}`;
                } else if (data.code) {
                    errorMessage += `: ${data.code}`;
                }
            } else if (error instanceof Error) {
                errorMessage += `: ${error.message}`;
            }

            messageApi.error(errorMessage, 5); // Show longer for readability
        }
    };

    if (!product) return null;

    return (
        <Modal
            open={open}
            onCancel={() => {
                if (isDirty) {
                    if (window.confirm(t('unsavedChangesWarning') || 'You have unsaved changes. Discard?')) {
                        onClose();
                    }
                } else {
                    onClose();
                }
            }}
            width={1200}
            title={t('editProduct')}
            footer={null} // Custom footer inside form
            centered
            className="product-detail-modal"
            styles={{ body: { padding: 0, overflow: 'hidden' } }} // Maximize space
        >
            <FormProvider {...methods}>
                <Form layout="vertical" component="div" style={{ display: 'flex', flexDirection: 'column', height: '80vh' }}>

                    {/* Scrollable Content Area */}
                    <div style={{ flex: 1, overflowY: 'auto', padding: 24, background: '#f0f2f5' }}>
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

                    {/* Fixed Footer */}
                    <div style={{
                        padding: '16px 24px',
                        background: '#fff',
                        borderTop: '1px solid #e8e8e8',
                        display: 'flex',
                        justifyContent: 'flex-end',
                        gap: 12
                    }}>
                        <Button
                            icon={<CloseOutlined />}
                            onClick={onClose}
                        >
                            {t('cancel')}
                        </Button>
                        {/* Use fullProduct.permalink if available, fallback to product.permalink */}
                        {(fullProduct?.permalink || product.permalink) && (
                            <Button
                                icon={<GlobalOutlined />}
                                href={fullProduct?.permalink || product.permalink}
                                target="_blank"
                            >
                                {t('viewOnSite')}
                            </Button>
                        )}
                        <Button
                            type="primary"
                            icon={<SaveOutlined />}
                            onClick={handleSubmit(handleSave)}
                            loading={updateMutation.isPending}
                        >
                            {t('saveChanges')}
                        </Button>
                    </div>
                </Form>
            </FormProvider>
        </Modal>
    );
};
