import React from 'react';
import { Card, Input, InputNumber, Button, Space, Row, Col, Form, Switch, Typography } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { DeleteOutlined, EditOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '@/features/products/types/schemas';
import { VariationImageUpload } from './VariationImageUpload';

const { Text } = Typography;

interface ProductVariationCardProps {
    variation: any;
    index: number;
    control: Control<ProductFormValues>;
    onRemove: () => void;
    parentName?: string; // Parent product name for fallback
    errors?: any; // Form errors for validation display
    onEdit?: () => void;
}

export const ProductVariationCard: React.FC<ProductVariationCardProps> = ({
    variation,
    index,
    control,
    onRemove,
    parentName,
    errors,
    onEdit
}) => {
    const { t } = useLanguage();

    return (
        <Card
            size="small"
            extra={
                <Space>
                    <Button
                        type="text"
                        size="small"
                        icon={<EditOutlined />}
                        onClick={onEdit}
                    />
                    <Button
                        danger
                        type="text"
                        size="small"
                        icon={<DeleteOutlined />}
                        onClick={onRemove}
                    />
                </Space>
            }
            style={{ height: '100%' }}
        >
            <Space direction="vertical" size={16} style={{ width: '100%' }}>
                {/* Row 1: Image Upload - Full Width */}
                <Form.Item label={t('variationImage')} style={{ marginBottom: 0 }}>
                    <Controller
                        name={`variations.${index}.image`}
                        control={control}
                        render={({ field }) => (
                            <VariationImageUpload
                                value={field.value}
                                onChange={field.onChange}
                            />
                        )}
                    />
                </Form.Item>


                {/* Row 2: Variation Title (Attributes) */}
                <div>
                    <Text type="secondary" style={{ fontSize: 12, display: 'block', marginBottom: 4 }}>
                        {t('variationTitle') || 'כותרת'}
                    </Text>
                    {/* Tags removed as per request */}
                    <div style={{ display: 'flex', gap: 4, flexWrap: 'wrap' }}>
                        {variation.attributes?.length > 0 ? (
                            variation.attributes.map((attr: any, i: number) => (
                                <Text key={i} style={{ fontSize: 13 }}>
                                    {attr.name}: {attr.option}{i < variation.attributes.length - 1 ? ', ' : ''}
                                </Text>
                            ))
                        ) : (
                            <Text style={{ fontSize: 13 }}>{parentName || 'No title'}</Text>
                        )}
                    </div>
                </div>

                {/* Row 3: SKU */}
                <Form.Item label={t('sku')} style={{ marginBottom: 0 }}>
                    <Controller
                        name={`variations.${index}.sku`}
                        control={control}
                        render={({ field }) => (
                            <Input {...field} placeholder="SKU-001" />
                        )}
                    />
                </Form.Item>

                {/* Row 4: Pricing */}
                <Row gutter={8}>
                    <Col span={12}>
                        <Form.Item
                            label={t('regularPrice')}
                            style={{ marginBottom: 0 }}
                            validateStatus={errors?.variations?.[index]?.regular_price ? 'error' : ''}
                            help={errors?.variations?.[index]?.regular_price?.message}
                        >
                            <Controller
                                name={`variations.${index}.regular_price`}
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} prefix="₪" placeholder="0.00" />
                                )}
                            />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item label={t('salePrice')} style={{ marginBottom: 0 }}>
                            <Controller
                                name={`variations.${index}.sale_price`}
                                control={control}
                                render={({ field }) => (
                                    <Input {...field} prefix="₪" placeholder="0.00" />
                                )}
                            />
                        </Form.Item>
                    </Col>
                </Row>

                {/* Row 5: Stock Management */}
                <Controller
                    name={`variations.${index}.manage_stock`}
                    control={control}
                    render={({ field }) => (
                        <Space>
                            <Switch size="small" {...field} checked={field.value} />
                            <Text type="secondary">{t('manageStock')}</Text>
                        </Space>
                    )}
                />

                {/* Row 6: Stock Quantity - only show if manage_stock is true */}
                <Controller
                    name={`variations.${index}.manage_stock`}
                    control={control}
                    render={({ field: manageStockField }) => (
                        <>
                            {manageStockField.value && (
                                <Form.Item
                                    label={t('stockQuantity')}
                                    style={{ marginBottom: 0 }}
                                    validateStatus={errors?.variations?.[index]?.stock_quantity ? 'error' : ''}
                                    help={errors?.variations?.[index]?.stock_quantity?.message}
                                >
                                    <Controller
                                        name={`variations.${index}.stock_quantity`}
                                        control={control}
                                        render={({ field }) => (
                                            <InputNumber
                                                {...field}
                                                min={0}
                                                style={{ width: '100%' }}
                                                placeholder="0"
                                            />
                                        )}
                                    />
                                </Form.Item>
                            )}
                        </>
                    )}
                />
            </Space>
        </Card>
    );
};
