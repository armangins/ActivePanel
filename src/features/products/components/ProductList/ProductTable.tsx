import { Table, Space, Tag, Button, Avatar } from 'antd';
import { EditOutlined, DeleteOutlined, EyeOutlined, InboxOutlined } from '@ant-design/icons';
import { useMemo } from 'react';
import { Product } from '../../types';
import { useLanguage } from '@/contexts/LanguageContext';

interface ProductTableProps {
    products: Product[];
    isLoading?: boolean;
    onView: (product: Product) => void;
    onEdit: (product: Product) => void;
    onDelete: (product: Product) => void;
    selectedProductIds: Set<number>;
    onSelectionChange: (ids: Set<number>) => void;
}

export const ProductTable = ({
    products,
    isLoading = false,
    onView,
    onEdit,
    onDelete,
    selectedProductIds,
    onSelectionChange
}: ProductTableProps) => {
    const { formatCurrency, t } = useLanguage();

    const columns = useMemo(() => [
        {
            title: t('product'),
            key: 'product',
            render: (_: any, record: Product) => (
                <Space>
                    <Avatar
                        shape="square"
                        size={48}
                        src={record.images?.[0]?.src}
                        icon={<InboxOutlined />}
                        style={{ backgroundColor: '#f5f5f5' }}
                    />
                    <Space direction="vertical" size={0}>
                        <span style={{ fontWeight: 500 }}>{record.name}</span>
                        <span style={{ fontSize: 12, color: '#999' }}>SKU: {record.sku || '-'}</span>
                    </Space>
                </Space>
            )
        },
        {
            title: t('price'),
            key: 'price',
            render: (_: any, record: Product) => (
                <Space direction="vertical" size={0}>
                    <span style={{ fontWeight: 500 }}>{formatCurrency(record.price)}</span>
                    {record.regular_price && record.price !== record.regular_price && (
                        <span style={{ fontSize: 12, textDecoration: 'line-through', color: '#999' }}>
                            {formatCurrency(record.regular_price)}
                        </span>
                    )}
                </Space>
            )
        },
        {
            title: t('stock'),
            key: 'stock',
            render: (_: any, record: Product) => {
                const status = record.stock_status || 'instock';
                return (
                    <Tag color={status === 'instock' ? 'success' : 'error'}>
                        {status === 'instock' ? t('inStock') : t('outOfStock')}
                        {(record.stock_quantity || 0) > 0 && ` (${record.stock_quantity})`}
                    </Tag>
                );
            }
        },
        {
            title: t('type'),
            dataIndex: 'type',
            key: 'type',
            render: (type: string) => <Tag>{type}</Tag>,
            responsive: ['md'] as any // Hide on screens smaller than md (< 768px)
        },
        {
            title: t('actions'),
            key: 'actions',
            render: (_: any, record: Product) => (
                <Space>
                    <Button
                        type="text"
                        icon={<EyeOutlined />}
                        onClick={() => onView(record)}
                    />
                    <Button
                        type="text"
                        icon={<EditOutlined />}
                        onClick={() => onEdit(record)}
                    />
                    <Button
                        type="text"
                        danger
                        icon={<DeleteOutlined />}
                        onClick={() => onDelete(record)}
                    />
                </Space>
            )
        }
    ], [t, formatCurrency, onView, onEdit, onDelete]);

    const rowSelection = {
        selectedRowKeys: Array.from(selectedProductIds).filter(id => typeof id === 'number'),
        onChange: (selectedRowKeys: React.Key[]) => {
            onSelectionChange(new Set(selectedRowKeys.map(k => Number(k))));
        }
    };

    return (
        <Table
            dataSource={products}
            columns={columns}
            rowKey="id"
            loading={isLoading}
            pagination={false}
            rowSelection={rowSelection} // @ts-ignore
            scroll={{ x: 'max-content' }}
            onRow={(record) => ({
                onClick: () => onView(record),
                style: { cursor: 'pointer' }
            })}
        />
    );
};
