import React, { useState } from 'react';
import { Form, Button, Space, Spin, Typography } from 'antd';
import { ArrowLeftOutlined } from '@ant-design/icons';
import { useProductForm } from '../../hooks/useProductForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useMessage } from '@/contexts/MessageContext';
import { useCategories } from '@/hooks/useCategories';
import { useAttributes } from '@/hooks/useAttributes';
import { AddProductForm } from './AddProductForm';
import { useCreateProduct } from '../../hooks/useCreateProduct';
import { AddVariationModal } from './AddVariationModal';

export const ProductForm = () => {
    const { id } = useParams();
    const productId = id ? parseInt(id) : undefined;
    const { t } = useLanguage();
    const navigate = useNavigate();
    const messageApi = useMessage();

    const {
        form: { control, formState: { errors } },
        form,
        isLoading,
        isSaving,
        onSubmit: handleSave,
        isEditMode,
        handleGenerateSKU
    } = useProductForm(productId);

    const { data: categories = [] } = useCategories();
    const { data: globalAttributes = [] } = useAttributes();
    const { uploadProduct, uploadState } = useCreateProduct();

    const [isManualModalOpen, setIsManualModalOpen] = useState(false);
    const [editingVariationIndex, setEditingVariationIndex] = useState<number | null>(null);
    const productType = form.watch('type');
    const currentAttributes = form.watch('attributes');

    const handleEditVariation = (index: number) => {
        setEditingVariationIndex(index);
        setIsManualModalOpen(true);
    };

    const handleManualAdd = (data: any) => {
        // Sync attributes: Add any new attributes/options from the modal to the product form state
        const formAttributes = form.getValues('attributes') || [];
        const newFormAttributes = [...formAttributes];
        let attributesChanged = false;

        data.attributes.forEach((newAttr: any) => {
            const existingAttrIndex = newFormAttributes.findIndex((a: any) => a.name === newAttr.name);

            if (existingAttrIndex > -1) {
                // Attribute exists, check if option needs to be added
                const existingOptions = newFormAttributes[existingAttrIndex].options || [];
                if (!existingOptions.includes(newAttr.option)) {
                    newFormAttributes[existingAttrIndex] = {
                        ...newFormAttributes[existingAttrIndex],
                        options: [...existingOptions, newAttr.option]
                    };
                    attributesChanged = true;
                }
            } else {
                // Attribute does not exist, add it
                newFormAttributes.push({
                    id: newAttr.id,
                    name: newAttr.name,
                    options: [newAttr.option],
                    visible: true,
                    variation: true
                });
                attributesChanged = true;
            }
        });

        if (attributesChanged) {
            form.setValue('attributes', newFormAttributes, { shouldDirty: true });
        }

        const existingVariations = form.getValues('variations') || [];

        const newVariation = {
            id: editingVariationIndex !== null ? existingVariations[editingVariationIndex].id : 0,
            sku: data.sku || '',
            regular_price: data.regular_price,
            sale_price: data.sale_price,
            stock_quantity: data.stock_quantity || 0,
            stock_status: data.stock_status,
            manage_stock: data.manage_stock,
            attributes: data.attributes
        };

        if (editingVariationIndex !== null) {
            const updatedVariations = [...existingVariations];
            updatedVariations[editingVariationIndex] = {
                ...updatedVariations[editingVariationIndex],
                ...newVariation
            };
            form.setValue('variations', updatedVariations, { shouldDirty: true });
            messageApi.success(t('variationUpdated') || 'Variation updated');
        } else {
            form.setValue('variations', [...existingVariations, newVariation], { shouldDirty: true });
            messageApi.success(t('variationAdded') || 'Variation added manually');
        }

        setEditingVariationIndex(null);
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    const handleFormSubmit = async () => {
        console.log('🔵 Form submit triggered');

        // Trigger validation first
        const isValid = await form.trigger();

        console.log('🔵 Validation result:', isValid);
        console.log('🔵 Form errors:', form.formState.errors);
        console.log('🔵 Form values:', form.getValues());

        if (!isValid) {
            // Validation failed, show user-friendly error message
            console.log('❌ Validation failed, blocking submission');

            const errors = form.formState.errors;
            let errorMessage = 'נא למלא את כל השדות הנדרשים';

            // Build specific error message
            const errorFields: string[] = [];
            if (errors.name) errorFields.push('שם המוצר');
            if (errors.regular_price) errorFields.push('מחיר רגיל');
            if (errors.stock_quantity) errorFields.push('כמות במלאי');

            // Console log errors for debugging
            console.error('❌ VALIDATION ERRORS:', JSON.stringify(errors, null, 2));

            if (errors.variations) {
                if (Array.isArray(errors.variations)) {
                    const variationErrors = errors.variations;
                    // Count only non-null errors in the array
                    const errorCount = variationErrors.filter((v: any) => v).length;
                    if (errorCount > 0) {
                        errorFields.push(errorCount + ' וריאציות');
                    }
                } else {
                    // Fallback for non-array variation errors
                    errorFields.push('וריאציות (שגיאה כללית)');
                }
            }

            if (errorFields.length > 0) {
                errorMessage = 'שדות חסרים: ' + errorFields.join(', ');
            }

            messageApi.error(errorMessage);

            // Scroll to first error field
            const firstErrorField = document.querySelector('.ant-form-item-has-error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }

            return;
        }

        console.log('✅ Validation passed, proceeding with upload');

        // For new products, use upload flow with progress
        if (!isEditMode) {
            const formData = form.getValues();
            try {
                await uploadProduct(formData);
            } catch (error: any) {
                console.error('Upload failed:', error);
            }
        } else {
            // For edit mode, use normal submit
            handleSave(form.getValues());
        }
    };

    const formContent = (
        <AddProductForm
            form={form}
            control={control}
            errors={errors}
            categories={categories}
            isEditMode={!!isEditMode}
            onGenerateSKU={handleGenerateSKU}
            onEditVariation={handleEditVariation}
        />
    );

    return (
        <>
            {uploadState.isUploading && (
                <div style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    right: 0,
                    bottom: 0,
                    background: 'rgba(255, 255, 255, 0.8)',
                    zIndex: 2000,
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center'
                }}>
                    <Spin size="large" />
                    <Typography.Title level={4} style={{ marginTop: 16 }}>
                        {t('uploadingProduct')}...
                    </Typography.Title>
                    <Typography.Text type="secondary">
                        {uploadState.progress}% - {uploadState.currentStep}
                    </Typography.Text>
                </div>
            )}

            <Form
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{ type: 'simple', status: 'publish' }}
            >
                {/* Header */}
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 24 }}>
                    <Space align="center">
                        <Button
                            icon={<ArrowLeftOutlined />}
                            onClick={() => navigate('/products')}
                        />
                        <Typography.Title level={2} style={{ margin: 0 }}>
                            {isEditMode ? t('editProduct') : t('createProduct')}
                        </Typography.Title>
                    </Space>

                    {/* DEV: Test Data Buttons */}
                    {!isEditMode && (
                        <Space>
                            <Button
                                size="small"
                                onClick={() => {
                                    // Get today's date and 7 days from now in YYYY-MM-DD format
                                    const today = new Date();
                                    const nextWeek = new Date(today);
                                    nextWeek.setDate(today.getDate() + 7);
                                    const formatDate = (date: Date) => date.toISOString().split('T')[0];

                                    form.setValue('type', 'simple');
                                    form.setValue('name', 'Test Simple Product');
                                    form.setValue('sku', 'TEST-SIMPLE-' + Math.random().toString(36).substring(2, 7).toUpperCase());
                                    form.setValue('regular_price', '100');
                                    form.setValue('sale_price', '75');
                                    form.setValue('date_on_sale_from', formatDate(today));
                                    form.setValue('date_on_sale_to', formatDate(nextWeek));
                                    form.setValue('manage_stock', true);
                                    form.setValue('stock_quantity', 50);
                                    form.setValue('stock_status', 'instock');
                                    form.setValue('short_description', 'This is a test simple product with scheduled sale pricing.');
                                    form.setValue('description', 'Full description of the test simple product. This product has a regular price of $100 and is on sale for $75 for one week.');
                                }}
                                style={{ backgroundColor: '#52c41a', color: 'white' }}
                            >
                                📝 Fill Simple Product
                            </Button>
                            <Button
                                size="small"
                                onClick={() => {
                                    const today = new Date();
                                    const nextWeek = new Date(today);
                                    nextWeek.setDate(today.getDate() + 7);
                                    const formatDate = (date: Date) => date.toISOString().split('T')[0];

                                    form.setValue('type', 'variable');
                                    form.setValue('name', 'Test Variable Product');
                                    form.setValue('sku', 'TEST-VAR-' + Math.random().toString(36).substring(2, 7).toUpperCase());
                                    form.setValue('regular_price', '120');
                                    form.setValue('sale_price', '90');
                                    form.setValue('manage_stock', false);
                                    form.setValue('stock_status', 'instock');
                                    form.setValue('short_description', 'This is a test variable product.');
                                    form.setValue('description', 'Full description of the test variable product. Available in multiple variations.');
                                    form.setValue('attributes', [{ id: 1, name: 'Color', options: ['Red', 'Blue', 'Green'], visible: true, variation: true }]);
                                }}
                                style={{ backgroundColor: '#1890ff', color: 'white' }}
                            >
                                📦 Fill Variable Product
                            </Button>
                        </Space>
                    )}
                </div>

                {/* Form Content */}
                {formContent}

                {/* Sticky Actions Footer */}
                <div style={{
                    position: 'fixed',
                    bottom: 0,
                    left: 0,
                    right: 0,
                    zIndex: 999,
                    padding: '16px 24px',
                    background: '#fff',
                    borderTop: '1px solid #f0f0f0',
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)',
                    display: 'flex',
                    justifyContent: 'flex-end',
                }}>
                    <Space>
                        {productType === 'variable' && (
                            <Button
                                size="large"
                                onClick={() => setIsManualModalOpen(true)}
                            >
                                {t('addSpecificVariation') || 'Add Variations'}
                            </Button>
                        )}
                        <Button
                            type="primary"
                            htmlType="submit"
                            loading={isEditMode ? isSaving : uploadState.isUploading}
                            size="large"
                        >
                            {isEditMode ? t('update') : (t('uploadProduct') || t('publish') || 'Upload Product')}
                        </Button>
                    </Space>
                </div>
            </Form>

            {isManualModalOpen && (
                <AddVariationModal
                    visible={isManualModalOpen}
                    onCancel={() => {
                        setIsManualModalOpen(false);
                        setEditingVariationIndex(null);
                    }}
                    onAdd={handleManualAdd}
                    globalAttributes={globalAttributes}
                    initialValues={editingVariationIndex !== null ? form.getValues(`variations.${editingVariationIndex} `) : undefined}
                    isEditing={editingVariationIndex !== null}
                />
            )}
        </>
    );
};

