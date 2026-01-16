import { Table, Tag, Button, Space, Avatar, Typography, Grid, List, theme } from 'antd';
import type { Breakpoint } from 'antd';
import { SearchOutlined, InboxOutlined } from '@ant-design/icons';
import { Order } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text } = Typography;

interface OrdersTableProps {
    orders: Order[];
    onViewDetails: (order: Order) => void;
    isLoading: boolean;
}

export const OrdersTable = ({ orders, onViewDetails, isLoading }: OrdersTableProps) => {
    const { token } = theme.useToken();
    const { t, formatCurrency } = useLanguage();
    const screens = Grid.useBreakpoint();

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

    if (!screens.md) {
        return (
            <List
                dataSource={orders}
                loading={isLoading}
                renderItem={(order) => {
                    const firstItem = order.line_items?.[0];
                    const productImage = firstItem?.image?.src;
                    const productName = firstItem?.name || t('product');
                    const customerName = `${order.billing?.first_name || ''} ${order.billing?.last_name || ''}`.trim() || order.billing?.email || t('customer');

                    return (
                        <List.Item
                            onClick={() => onViewDetails(order)}
                            className="touch-manipulation"
                            style={{
                                cursor: 'pointer',
                                padding: '12px 16px',
                                borderBottom: `1px solid ${token.colorSplit}`,
                                backgroundColor: token.colorBgContainer
                            }}
                        >
                            <div style={{ display: 'flex', width: '100%', alignItems: 'center', gap: 12 }}>
                                {/* Product Image */}
                                <Avatar
                                    shape="square"
                                    size={48}
                                    src={productImage}
                                    icon={<InboxOutlined />}
                                    style={{ flexShrink: 0, backgroundColor: token.colorFillSecondary }}
                                />

                                {/* Middle Content */}
                                <div style={{ flex: 1, minWidth: 0, display: 'flex', flexDirection: 'column' }}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 4 }}>
                                        <Text strong style={{ fontSize: 14 }}>{customerName}</Text>
                                        <Text strong style={{ color: token.colorPrimary }}>{formatCurrency(parseFloat(order.total))}</Text>
                                    </div>

                                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', flexDirection: 'column' }}>
                                            <Text type="secondary" style={{ fontSize: 12 }}>
                                                #{order.id} • {productName}
                                            </Text>
                                            <Text type="secondary" style={{ fontSize: 11, marginTop: 2 }}>
                                                {new Date(order.date_created).toLocaleDateString()}
                                            </Text>
                                        </div>
                                        <Tag color={getStatusColor(order.status)} style={{ margin: 0, fontSize: 11 }}>
                                            {(t(order.status) || order.status).toUpperCase()}
                                        </Tag>
                                    </div>
                                </div>
                            </div>
                        </List.Item>
                    );
                }}
            />
        );
    }

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
                            style={{ backgroundColor: token.colorFillSecondary }}
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
            responsive: ['md'] as Breakpoint[],
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
