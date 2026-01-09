import React, { useEffect, useState } from 'react';
import { Modal, Table, Button, Form, Input, message, Popconfirm, Space } from 'antd';
import { EditOutlined, DeleteOutlined, PlusOutlined } from '@ant-design/icons';
import { useCreateAttributeTerm, useUpdateAttributeTerm, useDeleteAttributeTerm, useAttributeTerms } from '../../../hooks/useAttributes';

interface AttributeTermsModalProps {
    isOpen: boolean;
    onClose: () => void;
    attribute: {
        id: number;
        name: string;
    } | null;
}

const AttributeTermsModal: React.FC<AttributeTermsModalProps> = ({ isOpen, onClose, attribute }) => {
    const [form] = Form.useForm();
    const [editingTerm, setEditingTerm] = useState<any>(null);

    const { data: terms, isLoading } = useAttributeTerms(attribute?.id);
    const createTerm = useCreateAttributeTerm();
    const updateTerm = useUpdateAttributeTerm();
    const deleteTerm = useDeleteAttributeTerm();

    useEffect(() => {
        if (!isOpen) {
            setEditingTerm(null);
            form.resetFields();
        }
    }, [isOpen, form]);

    useEffect(() => {
        if (editingTerm) {
            form.setFieldsValue(editingTerm);
        } else {
            form.resetFields();
        }
    }, [editingTerm, form]);

    const handleSubmit = async (values: any) => {
        if (!attribute) return;

        try {
            if (editingTerm) {
                await updateTerm.mutateAsync({
                    attributeId: attribute.id,
                    termId: editingTerm.id,
                    data: values,
                });
                message.success('מונח עודכן בהצלחה');
                setEditingTerm(null);
            } else {
                await createTerm.mutateAsync({
                    attributeId: attribute.id,
                    data: values,
                });
                message.success('מונח נוצר בהצלחה');
            }
            form.resetFields();
        } catch (error) {
            message.error('שגיאה בשמירת המונח');
        }
    };

    const handleDelete = async (termId: number) => {
        if (!attribute) return;
        try {
            await deleteTerm.mutateAsync({ attributeId: attribute.id, termId });
            message.success('מונח נמחק בהצלחה');
        } catch (error) {
            message.error('שגיאה במחיקת המונח');
        }
    };

    const columns = [
        {
            title: 'שם',
            dataIndex: 'name',
            key: 'name',
        },
        {
            title: 'Slug',
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: 'תיאור',
            dataIndex: 'description',
            key: 'description',
        },
        {
            title: 'כמות',
            dataIndex: 'count',
            key: 'count',
        },
        {
            title: 'פעולות',
            key: 'actions',
            render: (_: any, record: any) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => setEditingTerm(record)}
                    />
                    <Popconfirm
                        title="האם אתה בטוח שברצונך למחוק מונח זה?"
                        onConfirm={() => handleDelete(record.id)}
                        okText="כן"
                        cancelText="לא"
                    >
                        <Button type="text" danger icon={<DeleteOutlined />} />
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    return (
        <Modal
            title={`ניהול מונחים: ${attribute?.name}`}
            open={isOpen}
            onCancel={onClose}
            footer={null}
            width={800}
        >
            <div className="mb-6 bg-gray-50 p-4 rounded-lg">
                <h4 className="text-sm font-medium mb-4">{editingTerm ? 'ערוך מונח' : 'הוסף מונח חדש'}</h4>
                <Form
                    form={form}
                    layout="inline"
                    onFinish={handleSubmit}
                    className="flex gap-4"
                >
                    <Form.Item
                        name="name"
                        rules={[{ required: true, message: 'נדרש שם' }]}
                        className="flex-1"
                    >
                        <Input placeholder="שם המונח" prefix={<PlusOutlined />} />
                    </Form.Item>
                    <Form.Item name="slug" className="flex-1">
                        <Input placeholder="Slug (אופציונלי)" />
                    </Form.Item>
                    <Form.Item name="description" className="flex-1">
                        <Input placeholder="תיאור" />
                    </Form.Item>
                    <Form.Item>
                        <Space>
                            <Button
                                type="primary"
                                htmlType="submit"
                                loading={createTerm.isPending || updateTerm.isPending}
                            >
                                {editingTerm ? 'עדכן' : 'הוסף'}
                            </Button>
                            {editingTerm && (
                                <Button onClick={() => setEditingTerm(null)}>ביטול</Button>
                            )}
                        </Space>
                    </Form.Item>
                </Form>
            </div>

            <Table
                dataSource={terms || []}
                columns={columns}
                rowKey="id"
                loading={isLoading}
                pagination={{ pageSize: 10 }}
                locale={{ emptyText: 'אין מונחים להצגה' }}
            />
        </Modal>
    );
};

export default AttributeTermsModal;
