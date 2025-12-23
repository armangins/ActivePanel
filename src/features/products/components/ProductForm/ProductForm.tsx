import { Form, Button, Space, Spin, Typography, message } from 'antd';
import { ArrowLeftOutlined, PlusOutlined } from '@ant-design/icons';
import { useProductForm } from '../../hooks/useProductForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCategories } from '@/hooks/useCategories';
import { AddProductForm } from './AddProductForm';
import { useWatch } from 'react-hook-form';
import { useCreateProduct } from '../../hooks/useCreateProduct';
import { useVariationGeneration } from '../../hooks/useVariationGeneration';

export const ProductForm = () => {
    const { id } = useParams();
    const productId = id ? parseInt(id) : null;
    const { t } = useLanguage();
    const navigate = useNavigate();
    const [messageApi, contextHolder] = message.useMessage();

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
    const { uploadProduct, uploadState } = useCreateProduct();

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
                        errorFields.push(`${errorCount} וריאציות`);
                    }
                } else {
                    // Fallback for non-array variation errors
                    errorFields.push('וריאציות (שגיאה כללית)');
                }
            }

            if (errorFields.length > 0) {
                errorMessage = `שדות חסרים: ${errorFields.join(', ')}`;
            }

            if (errorFields.length > 0) {
                errorMessage = `שדות חסרים: ${errorFields.join(', ')}`;
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

                // Show success message
                messageApi.success('המוצר נוצר בהצלחה!');

                // Navigate to products list
                navigate('/products');

            } catch (error: any) {
                console.error('❌ Upload failed:', error);
                // Show error message
                messageApi.error(error.message || 'אירעה שגיאה בעת יצירת המוצר');
            }
        } else {
            // For editing, use existing save logic
            form.handleSubmit(handleSave)();
        }
    };

    // Watch product type and attributes for Create Variations button
    const productType = useWatch({ control, name: 'type' });
    const currentAttributes = useWatch({ control, name: 'attributes' }) || [];

    // Watch parent product pricing to use as defaults for variations
    const parentRegularPrice = useWatch({ control, name: 'regular_price' }) || '';
    const parentSalePrice = useWatch({ control, name: 'sale_price' }) || '';

    // Use variation generation hook
    const { generateVariations } = useVariationGeneration({
        currentAttributes,
        parentRegularPrice,
        parentSalePrice,
        setValue: form.setValue,
        getValues: form.getValues
    });



    const formContent = (
        <AddProductForm
            control={control}
            errors={errors}
            categories={categories}
            handleGenerateSKU={handleGenerateSKU}
            setValue={form.setValue}
        />
    );

    return (
        <>
            {contextHolder}
            <Form layout="vertical" onFinish={handleFormSubmit} style={{ paddingBottom: 80 }}>
                {/* Header - Just Title and Back */}
                <div style={{
                    marginBottom: 24,
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center'
                }}>
                    <Space>
                        <Button icon={<ArrowLeftOutlined />} onClick={() => navigate('/products')}>
                            {t('back') || "Back"}
                        </Button>
                        <Typography.Title level={4} style={{ margin: 0 }}>
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
                    display: 'flex',
                    justifyContent: 'flex-end',
                    boxShadow: '0 -2px 10px rgba(0,0,0,0.05)'
                }}>
                    <Space>
                        {productType === 'variable' && currentAttributes.length >= 1 && (
                            <Button
                                type="default"
                                size="large"
                                icon={<PlusOutlined />}
                                onClick={generateVariations}
                            >
                                {t('createVariations')} ({currentAttributes.length})
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
        </>
    );
};
