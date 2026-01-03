import React from 'react';
import { Form, Input, Button, InputNumber, Checkbox, Row, Col, Typography } from 'antd';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '@/features/products/types/schemas';
import { generateUniqueSKU } from '@/utils/skuGenerator';
import { SparklesIcon } from '@/components/icons/SparklesIcon';

interface ProductInventoryProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    setValue: (name: any, value: any) => void;
}

export const ProductInventory: React.FC<ProductInventoryProps> = ({ control, errors, setValue }) => {
    const { t } = useLanguage();

    const handleGenerateSKU = () => {
        const sku = generateUniqueSKU();
        setValue('sku', sku);
    };

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Form.Item
                    label="מק״ט"
                    validateStatus={errors.sku ? 'error' : ''}
                    help={errors.sku?.message}
                >
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <Controller
                            name="sku"
                            control={control}
                            render={({ field }) => (
                                <Input
                                    {...field}
                                    placeholder="SKU-123"
                                    style={{ flex: 1 }}
                                />
                            )}
                        />
                        <Button
                            type="default"
                            size="middle"
                            icon={<SparklesIcon style={{ fontSize: 16 }} />}
                            onClick={handleGenerateSKU}
                            title={t('generateUniqueSKU') || 'Generate Unique SKU'}
                            style={{ minHeight: 'auto', height: '32px' }}
                        />
                    </div>
                </Form.Item>
            </Col>

            <Col xs={24} md={12}>
                {/* Container for Stock Quantity and Checkbox */}
                <div style={{ display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'flex-start' }}>
                    <Controller
                        name="manage_stock"
                        control={control}
                        render={({ field: { value: manageStock } }) => (
                            manageStock ? (
                                <Form.Item
                                    label={t('stockQuantity') || "כמות במלאי"}
                                    required
                                    style={{ marginBottom: 12 }}
                                >
                                    <Controller
                                        name="stock_quantity"
                                        control={control}
                                        render={({ field, fieldState: { error } }) => (
                                            <>
                                                <InputNumber
                                                    {...field}
                                                    placeholder="0"
                                                    style={{ width: '100%' }}
                                                    min={0}
                                                    status={error ? 'error' : ''}
                                                />
                                                {error && (
                                                    <Typography.Text type="danger" style={{ fontSize: 12, display: 'block', marginTop: 4 }}>
                                                        {error.message}
                                                    </Typography.Text>
                                                )}
                                            </>
                                        )}
                                    />
                                </Form.Item>
                            ) : <></>
                        )}
                    />

                    <Controller
                        name="manage_stock"
                        control={control}
                        render={({ field }) => (
                            <div style={{ display: 'flex', alignItems: 'center', height: '100%', minHeight: 32 }}>
                                <Checkbox
                                    checked={field.value}
                                    onChange={field.onChange}
                                >
                                    {t('manageStock')}
                                </Checkbox>
                            </div>
                        )}
                    />
                </div>
            </Col>
        </Row>
    );
};
