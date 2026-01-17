import React from 'react';
import { Card, Button, Input, InputNumber, Typography, Space, Upload, Empty, Table } from 'antd';
import { useFieldArray, Controller } from 'react-hook-form';
import { DeleteOutlined, UploadOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { VariationImagePreview } from '../../ProductForm/Variations/VariationImagePreview';
import './DetailsVariations.css';

const { Title, Text } = Typography;

interface DetailsVariationsProps {
    control: any;
    onOpenVariationModal: () => void;
}

export const DetailsVariations: React.FC<DetailsVariationsProps> = ({ control }) => {
    const { t } = useLanguage();

    const { fields, remove } = useFieldArray({
        control,
        name: 'variations'
    });

    return (
        <Card variant="borderless" className="details-card details-variations-card">
            <Space direction="vertical" size="large" style={{ width: '100%' }} className="variations-header">
                <Space direction="vertical" size="middle" style={{ width: '100%' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <div>
                            <Title level={4} className="variation-section-title">{t('variations') || 'Variations'}</Title>
                            <Text type="secondary">{t('ניהול וריאציות') || 'Manage stock and prices for different options.'}</Text>
                        </div>
                        <Button type="primary" onClick={onOpenVariationModal}>
                            {t('addVariation') || 'Add Variation'}
                        </Button>
                    </div>
                </Space>
            </Space>

            {/* Variations Table */}
            <div className="variations-table-container" style={{ marginTop: 24 }}>
                <Table
                    dataSource={fields}
                    rowKey="id"
                    pagination={false}
                    size="small"
                    locale={{ emptyText: <Empty description={t('noVariations') || 'No variations'} image={Empty.PRESENTED_IMAGE_SIMPLE} /> }}
                    columns={[
                        {
                            title: t('image') || 'Image',
                            dataIndex: 'image',
                            width: 80,
                            render: (_, __, index) => (
                                <Controller
                                    name={`variations.${index}.image`}
                                    control={control}
                                    render={({ field: imgField }) => (
                                        <div style={{ width: 40, height: 40, cursor: 'pointer' }}>
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
                                                <div style={{ width: 40, height: 40 }}>
                                                    {imgField.value ? (
                                                        <VariationImagePreview image={imgField.value} size={40} showBorder />
                                                    ) : (
                                                        <div style={{
                                                            width: '100%',
                                                            height: '100%',
                                                            border: '1px dashed #d9d9d9',
                                                            borderRadius: 4,
                                                            display: 'flex',
                                                            alignItems: 'center',
                                                            justifyContent: 'center'
                                                        }}>
                                                            <UploadOutlined style={{ color: '#ccc' }} />
                                                        </div>
                                                    )}
                                                </div>
                                            </Upload>
                                        </div>
                                    )}
                                />
                            )
                        },
                        {
                            title: t('variant') || 'Variant',
                            dataIndex: 'attributes',
                            render: (_, __, index) => (
                                <Controller
                                    control={control}
                                    name={`variations.${index}.attributes`}
                                    render={({ field: attrsField }) => (
                                        <Text strong>
                                            {attrsField.value?.map((a: any) => a.display_option || a.option).join(' / ') || `Variant ${index + 1}`}
                                        </Text>
                                    )}
                                />
                            )
                        },
                        {
                            title: t('sku') || 'SKU',
                            dataIndex: 'sku',
                            width: 150,
                            render: (_, __, index) => (
                                <Controller
                                    name={`variations.${index}.sku`}
                                    control={control}
                                    render={({ field }) => (
                                        <Input {...field} placeholder="SKU" size="small" />
                                    )}
                                />
                            )
                        },
                        {
                            title: t('regularPrice') || 'Price',
                            dataIndex: 'regular_price',
                            width: 120,
                            render: (_, __, index) => (
                                <Controller
                                    name={`variations.${index}.regular_price`}
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            prefix="₪"
                                            placeholder="0.00"
                                            style={{ width: '100%' }}
                                            size="small"
                                        />
                                    )}
                                />
                            )
                        },
                        {
                            title: t('salePrice') || 'Sale Price',
                            dataIndex: 'sale_price',
                            width: 120,
                            render: (_, __, index) => (
                                <Controller
                                    name={`variations.${index}.sale_price`}
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            prefix="₪"
                                            placeholder="0.00"
                                            style={{ width: '100%' }}
                                            size="small"
                                        />
                                    )}
                                />
                            )
                        },
                        {
                            title: t('stock') || 'Stock',
                            dataIndex: 'stock_quantity',
                            width: 100,
                            render: (_, __, index) => (
                                <Controller
                                    name={`variations.${index}.stock_quantity`}
                                    control={control}
                                    render={({ field }) => (
                                        <InputNumber
                                            {...field}
                                            placeholder="0"
                                            style={{ width: '100%' }}
                                            size="small"
                                        />
                                    )}
                                />
                            )
                        },
                        {
                            title: '',
                            key: 'action',
                            width: 50,
                            render: (_, __, index) => (
                                <Button
                                    type="text"
                                    danger
                                    icon={<DeleteOutlined />}
                                    onClick={() => remove(index)}
                                    size="small"
                                />
                            )
                        }
                    ]}
                />
            </div>
        </Card >
    );
};
