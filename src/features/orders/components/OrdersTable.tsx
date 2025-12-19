import { Table, Tag, Button, Space, Avatar, Typography } from 'antd';
import { SearchOutlined, InboxOutlined, UserOutlined } from '@ant-design/icons';
import { Order } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

interface OrdersTableProps {
    orders: Order[];
    onViewDetails: (order: Order) => void;
    isLoading: boolean;
}

export const OrdersTable = ({ orders, onViewDetails, isLoading }: OrdersTableProps) => {
    const { t, isRTL, formatCurrency } = useLanguage();

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'completed': return 'success';
            case 'processing': return 'processing';
            case 'on-hold': return 'warning';
            case 'cancelled':
            case 'failed': return 'error';
            case 'refunded': return 'default';
            default: return 'default';
        }
    };

    const columns = [
        {
            title: t('product') || 'Product',
            key: 'product',
            render: (_: any, order: Order) => {
                const firstItem = order.line_items?.[0];
                const productImage = firstItem?.image?.src;
                const productName = firstItem?.name || t('product');
                const customerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim() || order.billing?.email || t('customer');

                return (
                    <Space>
                        <Avatar
                            shape="square"
                            size={48}
                            src={productImage}
                            icon={<InboxOutlined />}
                            style={{ backgroundColor: '#f0f2f5' }}
                        />
                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                            <Text strong>{customerName}</Text>
                            <Text type="secondary" style={{ fontSize: 12 }}>{productName}</Text>
                        </div>
                    </Space>
                );
            }
        },
        {
            title: t('orderId') || 'Order ID',
            dataIndex: 'id',
            key: 'id',
            render: (id: number) => <Text>#{id}</Text>
        },
        {
            title: t('date') || 'Date',
            dataIndex: 'date_created',
            key: 'date',
            responsive: ['md'],
            render: (date: string) => new Date(date).toLocaleDateString()
        },
        {
            title: t('total') || 'Total',
            dataIndex: 'total',
            key: 'total',
            render: (total: string) => <Text strong>{formatCurrency(parseFloat(total))}</Text>
        },
        {
            title: t('status') || 'Status',
            dataIndex: 'status',
            key: 'status',
            render: (status: string) => (
                <Tag color={getStatusColor(status)}>
                    {(t(status) || status).toUpperCase()}
                </Tag>
            )
        },
        {
            title: t('actions') || 'Actions',
            key: 'actions',
            render: (_: any, order: Order) => (
                <Button
                    icon={<SearchOutlined />}
                    size="small"
                    onClick={() => onViewDetails(order)}
                >
                    {t('view') || 'View'}
                </Button>
            )
        }
    ];

    return (
        <Table
            dataSource={orders}
            columns={columns} // @ts-ignore
            rowKey="id"
            loading={isLoading}
            pagination={false}
            scroll={{ x: true }}
            onRow={(record) => ({
                onClick: () => onViewDetails(record),
                style: { cursor: 'pointer' }
            })}
        />
    );
};
