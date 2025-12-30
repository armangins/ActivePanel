import { Card, Avatar, Typography, Badge, Tooltip } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, EnvironmentOutlined, ShoppingOutlined } from '@ant-design/icons';
import { Customer } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text, Title } = Typography;

interface CustomerCardProps {
    customer: Customer;
    onClick: (customer: Customer) => void;
}

export const CustomerCard = ({ customer, onClick }: CustomerCardProps) => {
    const { t, isRTL, formatCurrency } = useLanguage();

    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.username;

    return (
        <Card
            hoverable
            onClick={() => onClick(customer)}
            style={{ height: '100%' }}
        >
            <div style={{ display: 'flex', gap: 16, alignItems: 'flex-start' }}>
                <Avatar
                    size={48}
                    icon={<UserOutlined />}
                    src={customer.avatar_url}
                    style={{ backgroundColor: '#e6f7ff', color: '#1890ff' }}
                />
                <div style={{ flex: 1, minWidth: 0 }}>
                    <Title level={5} style={{ margin: 0 }} ellipsis>
                        {fullName}
                    </Title>
                    <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 13 }}>
                        {customer.username}
                    </Text>
                </div>
            </div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
                {customer.email && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <MailOutlined style={{ color: '#8c8c8c' }} />
                        <Text ellipsis style={{ fontSize: 13 }}>{customer.email}</Text>
                    </div>
                )}
                {customer.billing?.phone && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <PhoneOutlined style={{ color: '#8c8c8c' }} />
                        <Text ellipsis style={{ fontSize: 13 }}>{customer.billing.phone}</Text>
                    </div>
                )}
                {customer.billing?.city && (
                    <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                        <EnvironmentOutlined style={{ color: '#8c8c8c' }} />
                        <Text ellipsis style={{ fontSize: 13 }}>
                            {customer.billing.city}, {customer.billing.country}
                        </Text>
                    </div>
                )}
            </div>

            <div style={{ marginTop: 16, paddingTop: 16, borderTop: '1px solid #f0f0f0', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <div style={{ display: 'flex', gap: 8, alignItems: 'center' }}>
                    <ShoppingOutlined />
                    <Text>{customer.completed_orders_count ?? customer.orders_count ?? 0} {t('completedOrders') || 'Completed Orders'}</Text>
                </div>
                <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
                    {customer.avg_purchase && (
                        <Text type="secondary" style={{ fontSize: 12 }}>
                            {t('avgPurchase') || 'Avg'}: {formatCurrency(customer.avg_purchase)}
                        </Text>
                    )}
                    {customer.total_spent && (
                        <Text strong>
                            {formatCurrency(customer.total_spent)}
                        </Text>
                    )}
                </div>
            </div>
        </Card>
    );
};
