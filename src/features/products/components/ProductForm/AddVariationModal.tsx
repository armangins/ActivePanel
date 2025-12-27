import React, { useState, useEffect } from 'react';
import { Modal, Select, Form, Alert, Input, InputNumber, Checkbox, Row, Col, Divider, message, Spin } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAttributeTerms } from '@/hooks/useAttributes';

interface Attribute {
    id: number;
    name: string;
    options: string[];
    variation?: boolean;
    visible?: boolean;
}

interface NewVariationData {
    attributes: { id: number; name: string; option: string }[];
    sku?: string;
    regular_price: string;
    sale_price?: string;
    manage_stock: boolean;
    stock_quantity?: number;
    stock_status: 'instock' | 'outofstock' | 'onbackorder';
}

interface AttributeTermSelectorProps {
    attribute: any;
    form: any;
    onSelect: (attrName: string, term: string) => void;
}

const AttributeTermSelector: React.FC<AttributeTermSelectorProps> = ({ attribute, form, onSelect }) => {
    const { data: terms, isLoading } = useAttributeTerms(attribute.id);
    const selectedValue = Form.useWatch(attribute.name, form);

    if (isLoading) return <Spin size="small" />;

    // Use fetched terms if available, otherwise fall back to attribute options (legacy behavior)
    const options = terms && terms.length > 0 ? terms.map((t: any) => t.name) : (attribute.options || []);

    if (!options || options.length === 0) {
        return <div style={{ color: '#999', fontSize: 13, fontStyle: 'italic' }}>No options available</div>;
    }

    return (
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
            <Form.Item name={attribute.name} noStyle>
                <Input type="hidden" />
            </Form.Item>
            {options.map((option: string) => {
                const isSelected = selectedValue === option;
                return (
                    <div
                        key={option}
                        onClick={() => onSelect(attribute.name, option)}
                        style={{
                            padding: '6px 16px',
                            borderRadius: '20px',
                            border: isSelected ? '1px solid #1890ff' : '1px solid #d9d9d9',
                            background: isSelected ? '#e6f7ff' : '#fff',
                            color: isSelected ? '#1890ff' : 'rgba(0, 0, 0, 0.85)',
                            cursor: 'pointer',
                            fontSize: 14,
                            transition: 'all 0.2s',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 6
                        }}
                    >
                        {isSelected && <span style={{ fontSize: 12 }}>✓</span>}
                        {option}
                    </div>
                );
            })}
        </div>
    );
};

interface AddVariationModalProps {
    visible: boolean;
    onCancel: () => void;
    onAdd: (data: NewVariationData) => void;
    globalAttributes?: any[];
    initialValues?: any;
    isEditing?: boolean;
}

export const AddVariationModal: React.FC<AddVariationModalProps> = ({
    visible,
    onCancel,
    onAdd,
    globalAttributes = [],
    initialValues,
    isEditing = false
}) => {
    const { t } = useLanguage();
    const [form] = Form.useForm();
    const manageStock = Form.useWatch('manage_stock', form);

    // Initialize form - CLEAN START OR EDIT MODE
    useEffect(() => {
        if (visible) {
            form.resetFields();
            if (initialValues) {
                // If editing, populate form
                const formValues = {
                    ...initialValues,
                };
                // Flatten attributes for the form { "Color": "Blue" }
                if (initialValues.attributes) {
                    initialValues.attributes.forEach((attr: any) => {
                        formValues[attr.name] = attr.option;
                    });
                }
                form.setFieldsValue(formValues);
            }
        }
    }, [visible, form, initialValues]);

    const [, setTick] = useState(0);

    const handleTermSelect = (attrName: string, term: string) => {
        const currentValue = form.getFieldValue(attrName);
        if (currentValue === term) {
            form.setFieldValue(attrName, undefined); // Deselect
        } else {
            form.setFieldValue(attrName, term); // Select
        }
        // Force re-render to update UI chips
        setTick(t => t + 1);
    };

    const handleOk = () => {
        form.validateFields()
            .then(values => {
                const selectedAttributes: { id: number; name: string; option: string }[] = [];

                // Iterate over global attributes to find selected ones
                globalAttributes.forEach((attr: any) => {
                    const selectedOption = values[attr.name];
                    if (selectedOption) {
                        selectedAttributes.push({
                            id: attr.id,
                            name: attr.name,
                            option: selectedOption
                        });
                    }
                });

                if (selectedAttributes.length === 0) {
                    message.error(t('selectAtLeastOneAttribute') || 'Please select at least one attribute');
                    return;
                }

                const variationData: NewVariationData = {
                    attributes: selectedAttributes,
                    sku: values.sku,
                    regular_price: values.regular_price,
                    sale_price: values.sale_price,
                    manage_stock: values.manage_stock,
                    stock_quantity: values.stock_quantity,
                    stock_status: values.stock_status || 'instock'
                };

                onAdd(variationData);
                form.resetFields();
                // do not call onCancel here, the parent will handle closing (and should for editing)
                // actually, for 'add' we usually close, for 'update' we also close. 
                // The parent's handleManualAdd closes the modal.
                // But AddVariationModal is controlled by 'visible' prop.
                // Let's rely on parent to close, but we can't force it from here without onCancel if parent doesn't auto-close.
                // ProductForm implementation of handleManualAdd sets isManualModalOpen(true) -> wait, it sets it to true?
                // No, it handles closing there.
                // Wait, handleManualAdd in ProductForm (previous edit) checks editingVariationIndex != null and then calls setEditingVariationIndex(null)...
                // BUT it doesn't explicitly call setIsManualModalOpen(false) in handleManualAdd! 
                // It SHOULD close it. I need to check ProductForm again.
                // Checking previous ViewFile of ProductForm...
                // handleManualAdd does NOT call setIsManualModalOpen(false). 
                // However, onCancel does.
                // So I MUST call onCancel() here to trigger the close.
                onCancel();
            })
            .catch(info => {
                console.log('Validate Failed:', info);
            });
    };

    return (
        <Modal
            title={isEditing ? (t('editVariation') || 'Edit Variation') : (t('addSpecificVariation') || 'Add Specific Variation')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? (t('update') || 'Update') : (t('add') || 'Add')}
            cancelText={t('cancel') || 'Cancel'}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                name="add_variation_form"
                initialValues={{
                    manage_stock: false,
                    stock_status: 'instock'
                }}
            >
                <div style={{ marginBottom: 24, color: '#666' }}>
                    {t('manualVariationDesc') || "Select specific attributes and define pricing to create a new variation."}
                </div>

                {/* Attributes Chip Selection UI */}
                <div style={{ marginBottom: 24 }}>
                    {globalAttributes && globalAttributes.length > 0 ? (
                        globalAttributes.map((attr: any) => (
                            <div key={attr.id} style={{ marginBottom: 16 }}>
                                <div style={{ fontSize: 14, fontWeight: 600, marginBottom: 8 }}>{attr.name}</div>
                                <AttributeTermSelector
                                    attribute={attr}
                                    form={form}
                                    onSelect={handleTermSelect}
                                />
                            </div>
                        ))
                    ) : (
                        <Alert
                            type="warning"
                            message={t('noGlobalAttributes') || "No global attributes found."}
                        />
                    )}
                </div>

                <Divider orientation="left" style={{ margin: '12px 0' }}>{t('pricingAndInventory') || 'Pricing & Inventory'}</Divider>

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
                            name="sale_price"
                            label={t('salePrice')}
                        >
                            <Input prefix="₪" placeholder="0.00" />
                        </Form.Item>
                    </Col>
                </Row>

                <Row gutter={16}>
                    <Col span={12}>
                        <Form.Item
                            name="sku"
                            label={t('sku')}
                        >
                            <Input placeholder="SKU" />
                        </Form.Item>
                    </Col>
                    <Col span={12}>
                        <Form.Item
                            name="stock_status"
                            label={t('stockStatus')}
                            initialValue="instock"
                        >
                            <Select>
                                <Select.Option value="instock">{t('inStock') || 'In Stock'}</Select.Option>
                                <Select.Option value="outofstock">{t('outOfStock') || 'Out of Stock'}</Select.Option>
                                <Select.Option value="onbackorder">{t('onBackorder') || 'On Backorder'}</Select.Option>
                            </Select>
                        </Form.Item>
                    </Col>
                </Row>

                <Form.Item name="manage_stock" valuePropName="checked">
                    <Checkbox>{t('manageStock') || 'Manage Stock?'}</Checkbox>
                </Form.Item>

                {manageStock && (
                    <Form.Item
                        name="stock_quantity"
                        label={t('stockQuantity')}
                        rules={[{ required: true, message: t('required') || 'Required' }]}
                    >
                        <InputNumber style={{ width: '100%' }} min={0} />
                    </Form.Item>
                )}
            </Form>
        </Modal>
    );
};
