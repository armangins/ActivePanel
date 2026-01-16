import React from 'react';
import { Card, Button, Input, InputNumber, Typography, Checkbox, Tag, Space, Upload, Empty } from 'antd';
import { Control, useFieldArray, useWatch, Controller } from 'react-hook-form';
import { DeleteOutlined, PlusOutlined, UploadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { ProductFormValues } from '../../../types/schemas';
import './DetailsVariations.css';

const { Title, Text } = Typography;

interface DetailsVariationsProps {
    control: Control<ProductFormValues>;
    onOpenVariationModal: () => void;
}

export const DetailsVariations: React.FC<DetailsVariationsProps> = ({ control, onOpenVariationModal }) => {
    const { t } = useLanguage();
    // Watch attributes for the "Chips" display
    const attributes = useWatch({ control, name: 'attributes' }) || [];

    const { fields, remove } = useFieldArray({
        control,
        name: 'variations'
    });

    return (
        <Card variant="borderless" className="details-card details-variations-card">
            <div className="variations-header">
                <div className="variations-title-row">
                    <div>
                        <Title level={4} className="variation-section-title">{t('variations') || 'Variations'}</Title>
                        <Text type="secondary">{t('manageVariationsDesc') || 'Manage stock and prices for different options.'}</Text>
                    </div>
                    <Space>
                        <Button>{t('editOptions') || 'Edit Options'}</Button>
                        <Button type="primary" ghost icon={<PlusOutlined />} onClick={onOpenVariationModal}>
                            {t('addVariant') || 'Add Variant'}
                        </Button>
                    </Space>
                </div>

                {/* Attributes Chips */}
                <div className="attributes-section">
                    {attributes.map((attr, index) => (
                        <div key={index} className="attribute-group">
                            <Text strong className="attribute-label">
                                {attr.name}
                            </Text>
                            <Space size={8}>
                                {attr.options?.map((option, optIndex) => (
                                    <Tag key={optIndex} className="attribute-tag">
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
                <div className="variations-grid-header">
                    <div><Checkbox /></div>
                    <div>{t('variant') || 'Variant'}</div>
                    <div>{t('sku') || 'מק״ט'}</div>
                    <div>{t('regularPrice') || 'מחיר'}</div>
                    <div>{t('salePrice') || 'מחיר בצע'}</div>
                    <div>{t('stock') || 'במלאי'}</div>
                    <div></div>
                </div>

                {/* Rows */}
                {fields.map((field, index) => (
                    <div key={field.id} className="variations-grid-row">
                        <div>
                            <Checkbox />
                        </div>

                        {/* Variant Info (Image + Name) */}
                        <div className="variant-info">
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
                                        <div className="variant-image-uploader">
                                            {imgField.value ? (
                                                <img
                                                    src={imgField.value instanceof File ? URL.createObjectURL(imgField.value) : imgField.value.src}
                                                    alt="Var"
                                                    className="variant-image-preview"
                                                />
                                            ) : (
                                                <UploadOutlined style={{ color: '#ccc', fontSize: 16 }} />
                                            )}
                                        </div>
                                    </Upload>
                                )}
                            />
                            <div className="variant-attributes-column">
                                {/* Generate combination name based on attributes */}
                                <Controller
                                    control={control}
                                    name={`variations.${index}.attributes`}
                                    render={({ field: attrsField }) => (
                                        <Text strong className="variation-attributes-text">
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
                                    className="variation-input"
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
                                    className="variation-input"
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
                                    className="variation-input"
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
                    <div className="no-variations-state">
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t('noVariations') || 'No variations yet. Click "Add Variant" to start.'}
                        />
                    </div>
                )}
            </div>
        </Card >
    );
};
