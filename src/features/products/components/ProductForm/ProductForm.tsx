import { useState } from 'react';
import { Form, Spin } from 'antd';
import { useProductForm } from '@/features/products/hooks/useProductForm';
import { useNavigate, useParams } from 'react-router-dom';
import { useMessage } from '@/contexts/MessageContext';
import { useCategories } from '@/hooks/useCategories';
import { useAttributes } from '@/hooks/useAttributes';
import { AddProductForm } from './AddProductForm';
import { useCreateProduct } from '@/features/products/hooks/useCreateProduct';
import { AddVariationModal } from './Variations/AddVariationModal';

// Components
import { ProductFormHeader } from './Layout/ProductFormHeader';
import { ProductFormFooter } from './Layout/ProductFormFooter';
import { LoadingOverlay } from './Layout/LoadingOverlay';

// Hooks
import { useManualVariation } from '@/features/products/hooks/useManualVariation';

export const ProductForm = () => {
    const { id } = useParams();
    const productId = id ? parseInt(id) : undefined;
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

    // Watch parent values for manual variation defaults
    const parentSku = form.watch('sku');
    const parentManageStock = form.watch('manage_stock');
    const parentStockQuantity = form.watch('stock_quantity') ?? undefined;

    // Custom hook for manual variation logic
    const { handleManualAdd } = useManualVariation(form as any, editingVariationIndex, setEditingVariationIndex);

    const handleEditVariation = (index: number) => {
        setEditingVariationIndex(index);
        setIsManualModalOpen(true);
    };

    if (isLoading) {
        return <div style={{ textAlign: 'center', padding: 50 }}><Spin size="large" /></div>;
    }

    const handleFormSubmit = async () => {
        const isValid = await form.trigger();

        if (!isValid) {
            const errors = form.formState.errors;
            let errorMessage = 'נא למלא את כל השדות הנדרשים';

            const errorFields: string[] = [];
            if (errors.name) errorFields.push('שם המוצר');
            if (errors.regular_price) errorFields.push('מחיר רגיל');
            if (errors.stock_quantity) errorFields.push('כמות במלאי');

            if (errors.variations) {
                if (Array.isArray(errors.variations)) {
                    const variationErrors = errors.variations;
                    const errorCount = variationErrors.filter((v: any) => v).length;
                    if (errorCount > 0) {
                        errorFields.push(errorCount + ' וריאציות');
                    }
                } else {
                    errorFields.push('וריאציות (שגיאה כללית)');
                }
            }

            if (errorFields.length > 0) {
                errorMessage = 'שדות חסרים: ' + errorFields.join(', ');
            }

            messageApi.error(errorMessage);

            const firstErrorField = document.querySelector('.ant-form-item-has-error');
            if (firstErrorField) {
                firstErrorField.scrollIntoView({ behavior: 'smooth', block: 'center' });
            }
            return;
        }

        if (!isEditMode) {
            try {
                const values = form.getValues();
                await uploadProduct(values);

                // Show success message
                messageApi.success(`המוצר ${values.name} נוצר בהצלחה`);

                // Reset form to defaults
                form.reset({
                    type: 'simple',
                    status: 'publish',
                    name: '',
                    sku: '',
                    regular_price: '',
                    sale_price: '',
                    stock_quantity: 0,
                    stock_status: 'instock',
                    description: '',
                    short_description: '',
                    categories: [],
                    images: [],
                    attributes: [],
                    variations: []
                });

                // Scroll to top
                window.scrollTo({ top: 0, behavior: 'smooth' });

            } catch (error: any) {
                console.error('Upload failed:', error);
            }
        } else {
            handleSave(form.getValues());
        }
    };

    return (
        <>
            <LoadingOverlay
                isUploading={uploadState.isUploading}
                progress={uploadState.progress.percentage}
                currentStep={uploadState.progress.currentStep}
            />

            <Form
                layout="vertical"
                onFinish={handleFormSubmit}
                initialValues={{ type: 'simple', status: 'publish' }}
            >
                <ProductFormHeader
                    isEditMode={!!isEditMode}
                    onNavigateBack={() => navigate('/products')}
                />

                <AddProductForm
                    form={form}
                    control={control}
                    errors={errors}
                    setValue={form.setValue}
                    getValues={form.getValues}
                    categories={categories}
                    isEditMode={!!isEditMode}
                    onGenerateSKU={handleGenerateSKU}
                    onEditVariation={handleEditVariation}
                />

                <ProductFormFooter
                    isEditMode={!!isEditMode}
                    isSaving={isSaving}
                    isUploading={uploadState.isUploading}
                    productType={productType}
                    onAddVariation={() => setIsManualModalOpen(true)}
                />
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
                    initialValues={editingVariationIndex !== null ? form.getValues(`variations.${editingVariationIndex} ` as any) : undefined}
                    isEditing={editingVariationIndex !== null}
                    parentSku={parentSku}
                    parentManageStock={parentManageStock}
                    parentStockQuantity={parentStockQuantity}
                    existingAttributes={form.watch('attributes')}
                />
            )}
        </>
    );
};
