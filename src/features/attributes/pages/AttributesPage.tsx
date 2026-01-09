import React, { useState } from 'react';
import { Table, Button, Space, Card, Popconfirm, Input, Tooltip } from 'antd';
import { PlusOutlined, EditOutlined, DeleteOutlined, SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useAttributes, useDeleteAttribute } from '@/hooks/useAttributes';
import { AttributeModal } from '../components/AttributeModal';

const AttributesPage: React.FC = () => {
    const { t, isRTL } = useLanguage();
    const { data: attributes, isLoading, isError } = useAttributes();
    const deleteMutation = useDeleteAttribute();

    const [isModalVisible, setIsModalVisible] = useState(false);
    const [editingAttribute, setEditingAttribute] = useState<any>(null);
    const [searchText, setSearchText] = useState('');

    const handleAdd = () => {
        setEditingAttribute(null);
        setIsModalVisible(true);
    };

    const handleEdit = (record: any) => {
        setEditingAttribute(record);
        setIsModalVisible(true);
    };

    const handleDelete = (id: number) => {
        deleteMutation.mutate(id);
    };

    const handleModalCancel = () => {
        setIsModalVisible(false);
        setEditingAttribute(null);
    };

    const columns = [
        {
            title: t('name'),
            dataIndex: 'name',
            key: 'name',
            sorter: (a: any, b: any) => a.name.localeCompare(b.name),
        },
        {
            title: t('slug'),
            dataIndex: 'slug',
            key: 'slug',
        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <span style={{ textTransform: 'capitalize' }}>{type}</span>
        },
        {
            title: t('orderBy'),
            dataIndex: 'order_by',
            key: 'order_by',
            render: (orderBy: string) => {
                const map: Record<string, string> = {
                    'menu_order': t('menuOrder'),
                    'name': t('name'),
                    'name_num': t('nameNum'),
                    'id': t('id'),
                };
                return map[orderBy] || orderBy;
            }
        },
        {
            title: t('count'),
            dataIndex: 'count', // Standard WC API attribute has count? Let's check. 
            // If not, we might not show it or need to fetch it separately?
            // Actually, API response from /products/attributes does *not* strictly standardly include count unless extended.
            // But let's assume it does for now, or just remove if not present.
            // Wait, standard WP taxonomy listing has count.
            key: 'count',
        },
        {
            title: t('actions'),
            key: 'actions',
            width: 120,
            render: (_: any, record: any) => (
                <Space>
                    <Tooltip title={t('edit')}>
                        <Button
                            type="text"
                            icon={<EditOutlined />}
                            onClick={() => handleEdit(record)}
                        />
                    </Tooltip>
                    <Popconfirm
                        title={t('deleteConfirmTitle')}
                        description={t('deleteConfirmContent')}
                        onConfirm={() => handleDelete(record.id)}
                        okText={t('yes')}
                        cancelText={t('no')}
                    >
                        <Tooltip title={t('delete')}>
                            <Button
                                type="text"
                                danger
                                icon={<DeleteOutlined />}
                                loading={deleteMutation.isPending}
                            />
                        </Tooltip>
                    </Popconfirm>
                </Space>
            ),
        },
    ];

    const filteredAttributes = attributes?.filter((attr: any) =>
        attr.name.toLowerCase().includes(searchText.toLowerCase()) ||
        attr.slug.toLowerCase().includes(searchText.toLowerCase())
    );

    return (
        <div style={{ padding: 24, direction: isRTL ? 'rtl' : 'ltr' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 24, alignItems: 'center', flexWrap: 'wrap', gap: 16 }}>
                <h1 style={{ margin: 0, fontSize: 24 }}>{t('attributes')}</h1>
                <Button type="primary" icon={<PlusOutlined />} onClick={handleAdd}>
                    {t('addAttribute')}
                </Button>
            </div>

            <Card>
                <div style={{ marginBottom: 16, maxWidth: 400 }}>
                    <Input
                        prefix={<SearchOutlined />}
                        placeholder={t('searchAttributes')}
                        value={searchText}
                        onChange={(e) => setSearchText(e.target.value)}
                        allowClear
                    />
                </div>

                <Table
                    columns={columns}
                    dataSource={filteredAttributes}
                    rowKey="id"
                    loading={isLoading}
                    pagination={{ pageSize: 20 }}
                    scroll={{ x: true }}
                />
            </Card>

            <AttributeModal
                visible={isModalVisible}
                onCancel={handleModalCancel}
                attribute={editingAttribute}
            />
        </div>
    );
};

export default AttributesPage;
