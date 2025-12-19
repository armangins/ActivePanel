import { Card, Col, Row, Typography } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { AreaChart, Area, ResponsiveContainer } from 'recharts';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardStats } from '../types';

const { Text, Title } = Typography;

interface StatsOverviewProps {
    stats: DashboardStats;
    lowStockCount?: number;
}

// Generate deterministic mock data for the sparklines
const generateData = (key: string) => {
    const seed = key.length;
    return Array.from({ length: 15 }, (_, i) => ({
        value: Math.abs(Math.sin((i + seed) * 0.5) * 50 + 50 + (Math.random() * 20))
    }));
};

export const StatsOverview = ({ stats, lowStockCount }: StatsOverviewProps) => {
    const { t, formatCurrency } = useLanguage();

    const statItems = [
        {
            key: 'revenue',
            label: t('totalRevenue') || 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: <DollarOutlined />,
            color: '#f59e0b', // Amber/Orange
            bgColor: '#fffbeb'
        },
        {
            key: 'orders',
            label: t('totalOrders') || 'Total Orders',
            value: stats.totalOrders?.toLocaleString(),
            icon: <ShoppingCartOutlined />,
            color: '#3b82f6', // Blue
            bgColor: '#eff6ff'
        },
        {
            key: 'customers',
            label: t('totalCustomers') || 'Total Customers',
            value: stats.totalCustomers?.toLocaleString(),
            icon: <UserOutlined />,
            color: '#8b5cf6', // Purple
            bgColor: '#f5f3ff'
        },
        {
            key: 'products',
            label: t('totalProducts') || 'Total Products',
            value: stats.totalProducts?.toLocaleString(),
            icon: <AppstoreOutlined />,
            color: '#10b981', // Emerald
            bgColor: '#ecfdf5',
            // Simple indicator for low stock if needed, though mostly visual now
            isWarning: lowStockCount && lowStockCount > 0
        }
    ];

    return (
        <Row gutter={[16, 16]}>
            {statItems.map((item) => {
                const chartData = generateData(item.key);

                return (
                    <Col xs={24} sm={12} lg={6} key={item.key}>
                        <Card
                            hoverable
                            style={{
                                border: '1px solid #f0f0f0',
                                backgroundColor: '#fff',
                                borderRadius: 16,
                                overflow: 'hidden',
                                position: 'relative',
                                height: '100%',
                                boxShadow: '0 2px 10px rgba(0,0,0,0.02)'
                            }}
                            bodyStyle={{ padding: '24px 24px 0 24px', height: 160 }}
                        >
                            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, zIndex: 1, position: 'relative' }}>
                                {/* Hexagon Icon container */}
                                <div style={{
                                    background: item.color,
                                    color: '#fff',
                                    width: 48,
                                    height: 48,
                                    clipPath: 'polygon(50% 0%, 100% 25%, 100% 75%, 50% 100%, 0% 75%, 0% 25%)',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 22,
                                    flexShrink: 0
                                }}>
                                    {item.icon}
                                </div>

                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, color: '#9ca3af', display: 'block', marginBottom: 2 }}>
                                        {item.label}
                                    </Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 800, fontSize: 24, lineHeight: 1.2 }}>
                                        {item.value}
                                    </Title>
                                    {item.isWarning && (
                                        <Text type="warning" style={{ fontSize: 12 }}>
                                            {lowStockCount} {t('lowStock')}
                                        </Text>
                                    )}
                                </div>
                            </div>

                            {/* Decorative Chart at Bottom */}
                            <div style={{ position: 'absolute', bottom: 10, left: 10, right: 10, height: 60, opacity: 0.6 }}>
                                <ResponsiveContainer width="100%" height="100%">
                                    <AreaChart data={chartData}>
                                        <defs>
                                            <linearGradient id={`color-${item.key}`} x1="0" y1="0" x2="0" y2="1">
                                                <stop offset="5%" stopColor={item.color} stopOpacity={0.4} />
                                                <stop offset="95%" stopColor={item.color} stopOpacity={0} />
                                            </linearGradient>
                                        </defs>
                                        <Area
                                            type="monotone"
                                            dataKey="value"
                                            stroke={item.color}
                                            strokeWidth={3}
                                            fill={`url(#color-${item.key})`}
                                            isAnimationActive={false}
                                        />
                                    </AreaChart>
                                </ResponsiveContainer>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};
