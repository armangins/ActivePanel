import { Form, Input, Select, Card, Row, Col } from 'antd';
import { Controller, Control, FieldErrors, UseFormSetValue, useWatch, UseFormGetValues } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { ImageUpload } from './ImageUpload';
import { ProductAttributes } from './ProductAttributes';
import { ProductPricing } from './Pricing/ProductPricing';
import { ProductVariations } from './Variations/ProductVariations';
import { ProductTypeSelector } from './ProductTypeSelector';
import { ProductInventory } from './ProductInventory';

const { TextArea } = Input;

interface AddProductFormProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    categories: any[];
    handleGenerateSKU?: () => void;
    setValue: UseFormSetValue<ProductFormValues>;
    getValues: UseFormGetValues<ProductFormValues>;
    isEditMode?: boolean;
    onEditVariation?: (index: number) => void;
}
export const AddProductForm = ({ control, errors, categories, handleGenerateSKU, setValue, getValues, isEditMode, onEditVariation }: AddProductFormProps) => {
    const { t } = useLanguage();

    const productType = useWatch({ control, name: 'type' });
    const productName = useWatch({ control, name: 'name' }); // Get product name for variations

    return (
        <Row gutter={[24, 24]}>
            {/* LEFT COL: Product Details */}
            <Col xs={24} md={10}>
                <Card title={t('productDetails')} variant="borderless">

                    <ProductTypeSelector control={control} setValue={setValue} />

                    <Form.Item label={t('productName')} validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder={t('enterProductName')} />}
                        />
                    </Form.Item>

                    <ProductInventory
                        control={control}
                        errors={errors}
                        handleGenerateSKU={handleGenerateSKU}
                    />

                    <div style={{ marginBottom: 24 }} />

                    <Form.Item label={t('categories')}>
                        <Controller
                            name="categories"
                            control={control}
                            render={({ field }) => (
                                <Select
                                    {...field}
                                    mode="multiple"
                                    placeholder={t('selectCategories')}
                                    options={categories.map((c: any) => ({ label: c.name, value: c.id }))}
                                    onChange={(value) => field.onChange(value.map((id: number) => ({ id })))}
                                    value={Array.isArray(field.value) ? field.value.map((c: any) => c.id) : []}
                                />
                            )}
                        />
                    </Form.Item>

                    {/* Pricing Row */}
                    <ProductPricing control={control} errors={errors} setValue={setValue} productType={productType} />

                    <Form.Item label={t('shortDescription')}>
                        <Controller
                            name="short_description"
                            control={control}
                            render={({ field }) => <TextArea {...field} rows={2} />}
                        />
                    </Form.Item>

                    <Form.Item label={t('description')}>
                        <Controller
                            name="description"
                            control={control}
                            render={({ field }) => <TextArea {...field} rows={4} />}
                        />
                    </Form.Item>

                </Card>
            </Col>

            {/* RIGHT COL: Media + Attributes */}
            <Col xs={24} md={14}>
                <Card title={t('media')} variant="borderless">
                    <Form.Item>
                        <Controller
                            name="images"
                            control={control}
                            render={({ field }) => (
                                <ImageUpload
                                    value={field.value}
                                    onChange={field.onChange}
                                />
                            )}
                        />
                    </Form.Item>
                </Card>

                {productType === 'variable' && (
                    <ProductVariations
                        control={control}
                        parentName={productName}
                        errors={errors}
                        onEdit={onEditVariation}
                    />
                )}

                {productType === 'variable' && !isEditMode && (
                    <Card variant="borderless" style={{ marginTop: 24 }}>
                        <ProductAttributes control={control} setValue={setValue} getValues={getValues} />
                    </Card>
                )}
            </Col>
        </Row>
    );
};
