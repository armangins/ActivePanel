import React from 'react';
import { Form, Alert, Row, Col, Input, Select, Checkbox, InputNumber, Upload, Button, Image } from 'antd';
import { UploadOutlined, DeleteOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { getCombinationSignature } from '@/features/products/utils/variationUtils';

interface VariationReviewStepProps {
    form: any;
    combinations?: { id: number; name: string; option: string }[][];
    images?: Record<string, any>;
    onImageChange?: (signature: string, image: any) => void;
}

export const VariationReviewStep: React.FC<VariationReviewStepProps> = ({
    form,
    combinations = [],
    images = {},
    onImageChange
}) => {
    const { t } = useLanguage();

    return (
        <Form
            form={form}
            layout="vertical"
            name="add_variation_form"
            initialValues={{
                manage_stock: false,
                stock_status: 'instock'
            }}
        >

            {combinations.length > 0 && (
                <div style={{ marginBottom: 24, padding: 16, background: '#fafafa', borderRadius: 8, maxHeight: 300, overflowY: 'auto' }}>
                    <div style={{ fontWeight: 600, marginBottom: 8 }}>
                        {t('variationsPreview')} ({combinations.length}):
                    </div>
                    {combinations.map((combo, index) => {
                        const signature = getCombinationSignature(combo);
                        const currentImage = images[signature];

                        return (
                            <div key={index} style={{ marginBottom: 8, fontSize: 13, borderBottom: '1px solid #f0f0f0', paddingBottom: 8, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                    <span style={{ color: '#8c8c8c', minWidth: 24 }}>#{index + 1}</span>
                                    <span>{combo.map(c => `${c.name}: ${c.option}`).join(', ')}</span>
                                </div>
                                <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                    {currentImage ? (
                                        <div style={{ position: 'relative', width: 40, height: 40, borderRadius: 4, overflow: 'hidden', border: '1px solid #d9d9d9' }}>
                                            <Image
                                                src={typeof currentImage === 'string' ? currentImage : URL.createObjectURL(currentImage)}
                                                width={40}
                                                height={40}
                                                preview={false}
                                                style={{ objectFit: 'cover' }}
                                            />
                                            <div
                                                style={{
                                                    position: 'absolute',
                                                    top: 0,
                                                    right: 0,
                                                    bottom: 0,
                                                    left: 0,
                                                    background: 'rgba(0,0,0,0.5)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    justifyContent: 'center',
                                                    opacity: 0,
                                                    transition: 'opacity 0.2s',
                                                    cursor: 'pointer'
                                                }}
                                                onMouseEnter={e => e.currentTarget.style.opacity = '1'}
                                                onMouseLeave={e => e.currentTarget.style.opacity = '0'}
                                                onClick={() => onImageChange?.(signature, null)}
                                            >
                                                <DeleteOutlined style={{ color: '#fff' }} />
                                            </div>
                                        </div>
                                    ) : (
                                        <Upload
                                            showUploadList={false}
                                            beforeUpload={(file) => {
                                                onImageChange?.(signature, file);
                                                return false;
                                            }}
                                            accept="image/*"
                                        >
                                            <Button size="small" icon={<UploadOutlined />} />
                                        </Upload>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            <Row gutter={16}>
                <Col span={12}>
                    <Form.Item
                        name="regular_price"
                        label={t('regularPrice')}
                        rules={[{ required: true, message: t('required') || 'Required' }]}
                    >
                        <Input prefix="₪" placeholder="0.00" />
                    </Form.Item>
                </Col>
                <Col span={12}>
                    <Form.Item
                        name="stock_status"
                        label={t('stockStatus')}
                        initialValue="instock"
                    >
                        <Select>
                            <Select.Option value="instock">{t('instock') || 'In Stock'}</Select.Option>
                            <Select.Option value="outofstock">{t('outofstock') || 'Out of Stock'}</Select.Option>
                            <Select.Option value="onbackorder">{t('onbackorder') || 'On Backorder'}</Select.Option>
                        </Select>
                    </Form.Item>
                </Col>
            </Row>

            <Form.Item name="manage_stock" valuePropName="checked">
                <Checkbox>{t('manageStockQuestion')}</Checkbox>
            </Form.Item>
            <Form.Item
                noStyle
                shouldUpdate={(prev, curr) => prev.manage_stock !== curr.manage_stock}
            >
                {({ getFieldValue }) =>
                    getFieldValue('manage_stock') ? (
                        <Form.Item
                            name="stock_quantity"
                            label={t('quantity') || 'Quantity'} // Using 'quantity' key if available or fallback
                            rules={[{ required: true, message: t('required') }]}
                        >
                            <InputNumber style={{ width: '100%' }} min={0} />
                        </Form.Item>
                    ) : null
                }
            </Form.Item>
        </Form>
    );
};
