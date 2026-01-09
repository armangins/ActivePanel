import React, { useEffect } from 'react';
import { Modal, Form, Input, Select, Button } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useCreateAttribute, useUpdateAttribute } from '@/hooks/useAttributes';

interface AttributeModalProps {
    visible: boolean;
    onCancel: () => void;
    attribute?: any; // If present, editing mode
}

export const AttributeModal: React.FC<AttributeModalProps> = ({ visible, onCancel, attribute }) => {
    const { t, isRTL } = useLanguage();
    const [form] = Form.useForm();
    const createMutation = useCreateAttribute();
    const updateMutation = useUpdateAttribute();

    const isEditing = !!attribute;
    const isLoading = createMutation.isPending || updateMutation.isPending;

    useEffect(() => {
        if (visible && attribute) {
            form.setFieldsValue({
                name: attribute.name,
                slug: attribute.slug,
                type: attribute.type || 'select',
                order_by: attribute.order_by || 'menu_order',
                has_archives: attribute.has_archives ?? true
            });
        } else {
            form.resetFields();
            form.setFieldsValue({
                type: 'select',
                order_by: 'menu_order',
                has_archives: true
            });
        }
    }, [visible, attribute, form]);

    const handleOk = () => {
        form.validateFields().then(values => {
            if (isEditing) {
                updateMutation.mutate({ id: attribute.id, data: values }, {
                    onSuccess: () => {
                        onCancel();
                        form.resetFields();
                    }
                });
            } else {
                createMutation.mutate(values, {
                    onSuccess: () => {
                        onCancel();
                        form.resetFields();
                    }
                });
            }
        });
    };

    return (
        <Modal
            title={isEditing ? t('editAttribute') : t('addAttribute')}
            open={visible}
            onOk={handleOk}
            onCancel={onCancel}
            okText={isEditing ? t('update') : t('create')}
            cancelText={t('cancel')}
            confirmLoading={isLoading}
            width={600}
        >
            <Form
                form={form}
                layout="vertical"
                style={{ direction: isRTL ? 'rtl' : 'ltr' }}
            >
                <Form.Item
                    name="name"
                    label={t('name')}
                    rules={[{ required: true, message: t('required') }]}
                >
                    <Input placeholder={t('attributeNamePlaceholder')} />
                </Form.Item>

                <Form.Item
                    name="slug"
                    label={t('slug')}
                    extra={t('slugDescription')}
                >
                    <Input placeholder={t('attributeSlugPlaceholder')} />
                </Form.Item>

                <Form.Item
                    name="type"
                    label={t('type')}
                >
                    <Select>
                        <Select.Option value="select">{t('select')}</Select.Option>
                        {/* Add more types if supported by plugins, e.g. color, image */}
                    </Select>
                </Form.Item>

                <Form.Item
                    name="order_by"
                    label={t('orderBy')}
                >
                    <Select>
                        <Select.Option value="menu_order">{t('menuOrder')}</Select.Option>
                        <Select.Option value="name">{t('name')}</Select.Option>
                        <Select.Option value="name_num">{t('nameNum')}</Select.Option>
                        <Select.Option value="id">{t('id')}</Select.Option>
                    </Select>
                </Form.Item>
            </Form>
        </Modal>
    );
};
