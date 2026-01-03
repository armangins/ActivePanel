import { useMemo } from 'react';
import { Table, Button as AntButton, Space, Tag } from 'antd';
import { DeleteOutlined as Trash2, EditOutlined as Edit } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { Category } from '../types';

interface CategoriesTableProps {
    categories: Category[];
    isLoading: boolean;
    onEdit: (category: Category) => void;
    onDelete: (id: number) => void;
}

const CategoriesTable = ({ categories, isLoading, onEdit, onDelete }: CategoriesTableProps) => {
    const { t, isRTL } = useLanguage();

    const columns = useMemo(() => [
        {
            title: t('name') || 'Name',
            key: 'name',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, category: Category) => (
                <div style={{ fontWeight: 500 }}>
                    {category.name}
                    {category.parent !== 0 && (
                        <span style={{ fontSize: 12, color: '#8c8c8c', marginRight: 8 }}>
                            (Sub)
                        </span>
                    )}
                </div>
            )
        },
        {
            title: t('count') || 'Count',
            dataIndex: 'count',
            key: 'count',
            render: (count: number) => (
                <Tag color="processing" style={{ borderRadius: 10, padding: '0 8px' }}>
                    {count || 0} {t('products') || 'Products'}
                </Tag>
            ),
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
        },
        {

            title: t('slug') || 'Slug',
            dataIndex: 'slug',
            key: 'slug',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
        },
        {
            title: t('actions') || 'Actions',
            key: 'actions',
            align: (isRTL ? 'right' : 'left') as 'left' | 'right',
            render: (_: any, category: Category) => (
                <Space size={8} style={{ direction: isRTL ? 'rtl' : 'ltr' }}>
                    <AntButton
                        type="text"
                        icon={<Edit />}
                        onClick={() => onEdit(category)}
                        style={{ color: '#1890ff' }}
                    />
                    <AntButton
                        type="text"
                        icon={<Trash2 />}
                        onClick={() => onDelete(category.id)}
                        danger
                    />
                </Space>
            )
        }
    ], [isRTL, t, onEdit, onDelete]);

    return (
        <Table
            columns={columns}
            dataSource={categories}
            rowKey="id"
            loading={isLoading}
            pagination={{ pageSize: 20 }}
        />
    );
};

export default CategoriesTable;
