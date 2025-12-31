import React from 'react';
import { Form, Input, Button, InputNumber, Checkbox, Row, Col, Typography } from 'antd';
import { Controller, Control, FieldErrors } from 'react-hook-form';
import { ThunderboltOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '@/features/products/types/schemas';

interface ProductInventoryProps {
    control: Control<ProductFormValues>;
    errors: FieldErrors<ProductFormValues>;
    handleGenerateSKU?: () => void;
}

export const ProductInventory: React.FC<ProductInventoryProps> = ({ control, errors, handleGenerateSKU }) => {
    const { t } = useLanguage();

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} md={12}>
                <Form.Item
                    label={t('sku')}
                    validateStatus={errors.sku ? 'error' : ''}
                    help={errors.sku?.message}
                >
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
