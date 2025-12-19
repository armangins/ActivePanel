import { Form, Input, Select, Card, Row, Col, Button, Segmented, ConfigProvider, InputNumber, Checkbox, Typography } from 'antd';
import { Controller, Control, FieldErrors, UseFormSetValue, useWatch } from 'react-hook-form';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';
import { ImageUpload } from './ImageUpload';
import { ProductAttributes } from './ProductAttributes';
import { ProductPricing } from './ProductPricing';

const { TextArea } = Input;



interface GeneralTabProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    categories: any[];
    handleGenerateSKU?: () => void;
    setValue: UseFormSetValue<ProductFormValues>;
}

export const GeneralTab = ({ control, errors, categories, handleGenerateSKU, setValue }: GeneralTabProps) => {
    const { t } = useLanguage();

    const productType = useWatch({ control, name: 'type' });

    return (
        <Row gutter={[24, 24]}>
            {/* LEFT COL: Product Details */}
            <Col xs={24} md={14}>
                <Card title={t('productDetails')} bordered={false}>
                    <Form.Item label={t('productType')}>
                        <Controller
                            name="type"
                            control={control}
                            render={({ field }) => (
                                <ConfigProvider
                                    theme={{
                                        components: {
                                            Segmented: {
                                                itemSelectedBg: '#1677ff',
                                                itemSelectedColor: '#ffffff',
                                                trackBg: '#e5e5e5', // Slightly darker for contrast
                                                itemColor: '#262626', // Pure black for unselected
                                                itemHoverColor: '#1677ff',
                                                itemHoverBg: 'rgba(0,0,0,0.05)',
                                            },
                                        },
                                    }}
                                >
                                    <Segmented
                                        {...field}
                                        options={[
                                            { label: t('simpleProduct'), value: 'simple' },
                                            { label: t('variableProduct'), value: 'variable' },
                                        ]}
                                        block
                                        size="large" // Make it larger for better visibility
                                    />
                                </ConfigProvider>
                            )}
                        />
                    </Form.Item>
                    <Form.Item label={t('productName')} validateStatus={errors.name ? 'error' : ''} help={errors.name?.message}>
                        <Controller
                            name="name"
                            control={control}
                            render={({ field }) => <Input {...field} placeholder={t('enterProductName')} />}
                        />
                    </Form.Item>

                    {/* SKU Row */}
                    {/* SKU & Stock Row */}
                    <Form.Item label={t('sku')} style={{ marginBottom: 0 }}>
                        <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                            {/* SKU Input */}
                            <div style={{ flex: 1 }}>
                                <Form.Item validateStatus={errors.sku ? 'error' : ''} help={errors.sku?.message}>
                                    <div style={{ display: 'flex', gap: 8 }}>
                                        <Controller
                                            name="sku"
                                            control={control}
                                            render={({ field }) => <Input {...field} placeholder="SKU-123" />}
                                        />
                                        {handleGenerateSKU && (
                                            <Button onClick={handleGenerateSKU} icon={<ThunderboltOutlined />} />
                                        )}
                                    </div>
                                </Form.Item>
                            </div>

                            {/* Stock Management and Quantity */}
                            <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                                <Form.Item style={{ marginBottom: 0 }}>
                                    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
                                        {/* Checkbox for Manage Stock */}
                                        <Controller
                                            name="manage_stock"
                                            control={control}
                                            render={({ field }) => (
                                                <Checkbox
                                                    checked={field.value}
                                                    onChange={field.onChange}
                                                >
                                                    {t('manageStock')}
                                                </Checkbox>
                                            )}
                                        />

                                        {/* Stock Quantity Input (Visible if Managed) */}
                                        <Controller
                                            name="manage_stock"
                                            control={control}
                                            render={({ field: { value: manageStock } }) => (
                                                manageStock ? (
                                                    <div style={{ width: 140 }}>
                                                        <Controller
                                                            name="stock_quantity"
                                                            control={control}
                                                            render={({ field, fieldState: { isTouched }, formState: { isSubmitted } }) => (
                                                                <>
                                                                    <InputNumber
                                                                        {...field}
                                                                        placeholder={t('stockQuantity') || "Stock Qty"}
                                                                        style={{ width: '100%' }}
                                                                        min={0}
                                                                        status={errors.stock_quantity && (isTouched || isSubmitted) ? 'error' : ''}
                                                                    />
                                                                    {errors.stock_quantity && (isTouched || isSubmitted) && (
                                                                        <Typography.Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                                                            {errors.stock_quantity.message}
                                                                        </Typography.Text>
                                                                    )}
                                                                </>
                                                            )}
                                                        />
                                                    </div>
                                                ) : null
                                            )}
                                        />
                                    </div>
                                </Form.Item>
                            </div>
                        </div>
                    </Form.Item>

                    {/* Spacer since we removed margin bottom from parent Form.Item */}
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
                    <ProductPricing control={control} errors={errors} setValue={setValue} />

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
            <Col xs={24} md={10}>
                <Card title={t('media')} bordered={false}>
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
                    <Card bordered={false} style={{ marginTop: 24 }}>
                        <ProductAttributes control={control} setValue={setValue} />
                    </Card>
                )}
            </Col>
        </Row>
    );
};
