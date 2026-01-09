import React from 'react';
import { Card, Button, Input, InputNumber, Typography, Checkbox, Tag, Space, Upload } from 'antd';
import { Control, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../types/schemas';

const { Title, Text } = Typography;

interface DetailsVariationsProps {
    control: Control<ProductFormValues>;
}

export const DetailsVariations: React.FC<DetailsVariationsProps> = ({ control }) => {
    const { t } = useLanguage();

    // Watch attributes for the "Chips" display
    const attributes = useWatch({ control, name: 'attributes' }) || [];

    const { fields, remove } = useFieldArray({
        control,
        name: 'variations'
    });

    return (
        <Card variant="borderless" className="details-card" styles={{ body: { padding: '0' } }}>
            <div style={{ padding: '24px 24px 0 24px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 8 }}>
                    <div>
                        <Title level={4} style={{ margin: 0, marginBottom: 4 }}>{t('variations') || 'Variations'}</Title>
                        <Text type="secondary">{t('manageVariationsDesc') || 'Manage stock and prices for different options.'}</Text>
                    </div>
                    <Space>
                        <Button>{t('editOptions') || 'Edit Options'}</Button>
                        <Button type="primary" ghost icon={<PlusOutlined />}>
                            {t('addVariant') || 'Add Variant'}
                        </Button>
                    </Space>
                </div>

                {/* Attributes Chips */}
                <div style={{ marginBottom: 24, marginTop: 24, display: 'flex', gap: 32 }}>
                    {attributes.map((attr, index) => (
                        <div key={index} style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Text strong style={{ textTransform: 'uppercase', fontSize: 13, color: '#666' }}>
                                {attr.name}
                            </Text>
                            <Space size={8}>
                                {attr.options?.map((option, optIndex) => (
                                    <Tag key={optIndex} style={{
                                        margin: 0,
                                        padding: '4px 12px',
                                        borderRadius: 16,
                                        border: '1px solid #E0E0E0',
                                        background: '#F5F5F5',
                                        fontSize: 13
                                    }}>
                                        {option}
                                    </Tag>
                                ))}
                            </Space>
                        </div>
                    ))}
                </div>
            </div>

            {/* Variations Table */}
            <div className="variations-table">
                {/* Header */}
                <div style={{
                    display: 'grid',
                    gridTemplateColumns: '40px 1.5fr 1fr 1fr 1fr 1fr 40px',
                    padding: '12px 24px',
                    borderBottom: '1px solid #f0f0f0',
                    background: '#FAFAFA',
                    fontSize: 13,
                    fontWeight: 600,
                    color: '#666'
                }}>
                    <div><Checkbox /></div>
                    <div>{t('variant') || 'Variant'}</div>
                    <div>{t('sku') || 'SKU'}</div>
                    <div>{t('regularPrice') || 'Regular Price'}</div>
                    <div>{t('salePrice') || 'Sale Price'}</div>
                    <div>{t('stock') || 'Stock'}</div>
                    <div></div>
                </div>

                {/* Rows */}
                {fields.map((field, index) => (
                    <div key={field.id} style={{
                        display: 'grid',
                        gridTemplateColumns: '40px 1.5fr 1fr 1fr 1fr 1fr 40px',
                        padding: '16px 24px',
                        borderBottom: '1px solid #f0f0f0',
                        alignItems: 'center',
                        gap: 16
                    }}>
                        <div>
                            <Checkbox />
                        </div>

                        {/* Variant Info (Image + Name) */}
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <Controller
                                name={`variations.${index}.image`}
                                control={control}
                                render={({ field: imgField }) => (
                                    <Upload
                                        showUploadList={false}
                                        beforeUpload={() => false}
                                        maxCount={1}
                                        onChange={(info) => {
                                            if (info.fileList.length > 0 && info.fileList[0].originFileObj) {
                                                imgField.onChange(info.fileList[0].originFileObj);
                                            }
                                        }}
                                    >
                                        <div style={{
                                            width: 40,
                                            height: 40,
                                            borderRadius: 6,
                                            background: '#f5f5f5',
                                            border: '1px solid #eee',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            cursor: 'pointer',
                                            overflow: 'hidden'
                                        }}>
                                            {imgField.value ? (
                                                <img
                                                    src={imgField.value instanceof File ? URL.createObjectURL(imgField.value) : imgField.value.src}
                                                    alt="Var"
                                                    style={{ width: '100%', height: '100%', objectFit: 'contain' }}
                                                />
                                            ) : (
                                                <UploadOutlined style={{ color: '#ccc', fontSize: 16 }} />
                                            )}
                                        </div>
                                    </Upload>
                                )}
                            />
                            <div style={{ display: 'flex', flexDirection: 'column' }}>
                                {/* Generate combination name based on attributes */}
                                <Controller
                                    control={control}
                                    name={`variations.${index}.attributes`}
                                    render={({ field: attrsField }) => (
                                        <Text strong style={{ fontSize: 14 }}>
                                            {attrsField.value?.map((a: any) => a.option).join(' / ') || `Variant ${index + 1}`}
                                        </Text>
                                    )}
                                />
                            </div>
                        </div>

                        {/* SKU */}
                        <Controller
                            name={`variations.${index}.sku`}
                            control={control}
                            render={({ field }) => (
                                <Input {...field} placeholder="SKU" />
                            )}
                        />

                        {/* Price */}
                        <Controller
                            name={`variations.${index}.regular_price`}
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    prefix="₪"
                                    style={{ width: '100%' }}
                                    placeholder="0.00"
                                />
                            )}
                        />

                        {/* Sale Price */}
                        <Controller
                            name={`variations.${index}.sale_price`}
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    prefix="₪"
                                    style={{ width: '100%' }}
                                    placeholder="0.00"
                                />
                            )}
                        />

                        {/* Stock */}
                        <Controller
                            name={`variations.${index}.stock_quantity`}
                            control={control}
                            render={({ field }) => (
                                <InputNumber
                                    {...field}
                                    style={{ width: '100%' }}
                                    placeholder="0"
                                />
                            )}
                        />

                        {/* Delete */}
                        <Button
                            type="text"
                            danger
                            icon={<DeleteOutlined />}
                            onClick={() => remove(index)}
                        />
                    </div>
                ))}

                {fields.length === 0 && (
                    <div style={{ padding: '32px', textAlign: 'center', color: '#999' }}>
                        {t('noVariations') || 'No variations yet. Click "Add Variant" to start.'}
                    </div>
                )}
            </div>
        </Card>
    );
};
