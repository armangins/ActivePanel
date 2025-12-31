import { Card, Avatar, Typography, Badge, Button, Divider, Tag } from 'antd';
import { UserOutlined, MailOutlined, PhoneOutlined, HistoryOutlined, RightOutlined } from '@ant-design/icons';
import { Customer } from '../types';
import { useLanguage } from '@/contexts/LanguageContext';

const { Text, Title } = Typography;

interface CustomerCardProps {
    customer: Customer;
    onClick: (customer: Customer) => void;
}

export const CustomerCard = ({ customer, onClick }: CustomerCardProps) => {
    const { t, formatCurrency } = useLanguage();

    const fullName = `${customer.first_name || ''} ${customer.last_name || ''}`.trim() || customer.username;
    const company = customer.billing?.company || customer.shipping?.company;

    const handleCall = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (customer.billing?.phone) {
            window.location.href = `tel:${customer.billing.phone}`;
        }
    };

    const handleEmail = (e: React.MouseEvent) => {
        e.stopPropagation();
        if (customer.email) {
            window.location.href = `mailto:${customer.email}`;
        }
    };

    return (
        <Card
            hoverable
            onClick={() => onClick(customer)}
            bodyStyle={{ padding: 0 }}
            style={{ height: '100%', borderRadius: 12, overflow: 'hidden' }}
        >
            {/* Header Section */}
            <div style={{ padding: 24, paddingBottom: 16 }}>
                <div style={{ display: 'flex', alignItems: 'center', marginBottom: 16 }}>
                    <div style={{ position: 'relative' }}>
                        <Avatar
                            size={64}
                            src={customer.avatar_url}
                            icon={<UserOutlined />}
                            style={{
                                backgroundColor: '#f0f2f5',
                                border: '2px solid #fff',
                                boxShadow: '0 2px 8px rgba(0,0,0,0.05)'
                            }}
                        />
                    </div>

                    <div style={{ flex: 1, marginLeft: 16, overflow: 'hidden' }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                            <Title level={4} style={{ margin: 0, marginBottom: 4 }} ellipsis>
                                {fullName}
                            </Title>
                            <RightOutlined style={{ color: '#bfbfbf', fontSize: 12 }} />
                        </div>
                        <Text type="secondary" ellipsis style={{ display: 'block', fontSize: 13 }}>
                            {company ? `${company} • ` : ''}{customer.email}
                        </Text>
                    </div>
                </div>

                {/* Stats Badges */}
                <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                    {customer.avg_purchase && (
                        <Tag
                            color="#f6ffed"
                            style={{
                                color: '#52c41a',
                                border: '1px solid #b7eb8f',
                                borderRadius: 6,
                                padding: '2px 10px',
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 500
                            }}
                        >
                            {t('avgPurchase') || 'Avg Purchase'}: {formatCurrency(customer.avg_purchase)}
                        </Tag>
                    )}
                    {customer.total_spent && (
                        <Tag
                            color="#f5f5f5"
                            style={{
                                color: '#595959',
                                border: '1px solid #d9d9d9',
                                borderRadius: 6,
                                padding: '2px 10px',
                                margin: 0,
                                fontSize: 12,
                                fontWeight: 500
                            }}
                        >
                            {t('total') || 'Total'}: {formatCurrency(customer.total_spent)}
                        </Tag>
                    )}
                    {/* Fallback if no stats available */}
                    {!customer.avg_purchase && !customer.total_spent && (
                        <Tag style={{ border: 'none', background: 'transparent', padding: 0, color: '#bfbfbf' }}>
                            No history
                        </Tag>
                    )}
                </div>
            </div>

            {/* Actions Footer */}
            <div style={{
                borderTop: '1px solid #f0f0f0',
                display: 'flex',
                justifyContent: 'space-around',
                alignItems: 'center',
                padding: '12px 0',
                backgroundColor: '#fafafa'
            }}>
                <Button
                    type="text"
                    icon={<PhoneOutlined />}
                    disabled={!customer.billing?.phone}
                    onClick={handleCall}
                    style={{ flex: 1, color: '#595959' }}
                >
                    {t('call') || 'Call'}
                </Button>
                <Divider type="vertical" style={{ height: 24, margin: 0 }} />
                <Button
                    type="text"
                    icon={<MailOutlined />}
                    disabled={!customer.email}
                    onClick={handleEmail}
                    style={{ flex: 1, color: '#595959' }}
                >
                    {t('email') || 'Email'}
                </Button>
                <Divider type="vertical" style={{ height: 24, margin: 0 }} />
                <Button
                    type="text"
                    icon={<HistoryOutlined />}
                    onClick={(e) => { e.stopPropagation(); onClick(customer); }}
                    style={{ flex: 1, color: '#595959' }}
                >
                    {t('history') || 'History'}
                </Button>
            </div>
        </Card>
    );
};
