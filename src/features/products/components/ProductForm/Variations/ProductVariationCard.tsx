import React from 'react';
import { Card, Input, InputNumber, Button, Space, Row, Col, Form, Switch, Typography, Upload } from 'antd';
import { Controller, Control } from 'react-hook-form';
import { DeleteOutlined, UploadOutlined, EditOutlined, ThunderboltOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../../types/schemas';

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
                            <div style={{ width: '100%' }}>
                                <Upload
                                    listType="picture-card"
                                    maxCount={1}
                                    showUploadList={false} // Hide default list to use custom preview
                                    beforeUpload={() => false}
                                    fileList={
                                        field.value instanceof File
                                            ? [{
                                                uid: '-1',
                                                name: field.value.name,
                                                status: 'done' as const,
                                                url: URL.createObjectURL(field.value)
                                            }]
                                            : field.value?.src
                                                ? [{
                                                    uid: '-1',
                                                    name: field.value.name || 'image',
                                                    status: 'done' as const,
                                                    url: field.value.src
                                                }]
                                                : []
                                    }
                                    onChange={async (info) => {
                                        // Always take the last file (replacement)
                                        if (info.fileList.length > 0) {
                                            const file = info.fileList[info.fileList.length - 1]; // Take latest

                                            // Store the actual File object for upload
                                            if (file.originFileObj) {
                                                field.onChange(file.originFileObj);
                                            }
                                        }
                                    }}
                                    className="full-width-upload"
                                >
                                    {field.value ? (
                                        // Custom Preview with Overlays
                                        <div style={{ position: 'relative', width: '100%', height: 180, overflow: 'hidden', borderRadius: 8 }}>
                                            <img
                                                src={
                                                    field.value instanceof File
                                                        ? URL.createObjectURL(field.value)
                                                        : field.value?.src
                                                }
                                                alt="Variation"
                                                style={{ width: '100%', height: '100%', objectFit: 'contain', background: '#f5f5f5' }}
                                            />
                                            {/* Hover Overlay */}
                                            <div
                                                className="upload-overlay"
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    left: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    background: 'rgba(0,0,0,0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    gap: 8,
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                }}
                                            >
                                                {/* Replace Button - Trigger Upload */}
                                                <Button
                                                    type="text"
                                                    icon={<EditOutlined style={{ color: 'white', fontSize: 16 }} />}
                                                    title={t('replaceImage') || "Replace"}
                                                />

                                                {/* Remove Button */}
                                                <Button
                                                    type="text"
                                                    icon={<DeleteOutlined style={{ color: 'white', fontSize: 16 }} />}
                                                    title={t('removeImage') || "Remove"}
                                                    onClick={(e) => {
                                                        e.stopPropagation();
                                                        field.onChange(undefined);
                                                    }}
                                                />
                                            </div>
                                            <style>{`
                                                .full-width-upload:hover .upload-overlay {
                                                    opacity: 1 !important;
                                                }
                                            `}</style>
                                        </div>
                                    ) : (
                                        // Upload Placeholder
                                        <div style={{
                                            width: '100%',
                                            height: 180,
                                            display: 'flex',
                                            flexDirection: 'column',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}>
                                            <UploadOutlined style={{ fontSize: 32, color: '#999' }} />
                                            <div style={{ marginTop: 8, color: '#999' }}>{t('upload')}</div>
                                        </div>
                                    )}
                                </Upload>
                                <style>{`
                                    .full-width-upload .ant-upload-select {
                                        width: 100% !important;
                                        height: 180px !important;
                                        overflow: hidden;
                                        padding: 0 !important;
                                    }
                                `}</style>
                            </div>
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
