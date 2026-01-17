import { Card, Col, Row, Typography, theme } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    AppstoreOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardStats } from '../types';

const { Text, Title } = Typography;

interface StatsOverviewProps {
    stats: DashboardStats;
    lowStockCount?: number;
}

/**
 * StatsOverview Component
 * 
 * Displays key business metrics (Revenue, Orders, Customers, Products).
 * Uses Ant Design tokens for consistent theming.
 * 
 * @param props.stats - Dashboard statistics data
 * @param props.lowStockCount - Number of products with low stock (for warning)
 */
export const StatsOverview = ({ stats, lowStockCount }: StatsOverviewProps) => {
    const { token } = theme.useToken();
    const { t, formatCurrency } = useLanguage();

    const statItems = [
        {
            key: 'revenue',
            label: t('totalRevenue') || 'Total Revenue',
            value: formatCurrency(stats.totalRevenue),
            icon: <DollarOutlined />,
            color: token.colorWarning,
            bgColor: token.colorWarningBg
        },
        {
            key: 'orders',
            label: t('totalOrders') || 'Total Orders',
            value: stats.totalOrders?.toLocaleString(),
            icon: <ShoppingCartOutlined />,
            color: token.colorPrimary,
            bgColor: token.colorPrimaryBg
        },
        {
            key: 'customers',
            label: t('totalCustomers') || 'Total Customers',
            value: stats.totalCustomers?.toLocaleString(),
            icon: <UserOutlined />,
            color: token.colorInfo,
            bgColor: token.colorInfoBg
        },
        {
            key: 'products',
            label: t('totalProducts') || 'Total Products',
            value: stats.totalProducts?.toLocaleString(),
            icon: <AppstoreOutlined />,
            color: token.colorSuccess,
            bgColor: token.colorSuccessBg,
            isWarning: lowStockCount && lowStockCount > 0
        }
    ];

    return (
        <Row gutter={[16, 16]}>
            {statItems.map((item) => {
                const itemColor = item.color;
                const itemBg = item.bgColor;

                return (
                    <Col xs={12} sm={12} lg={6} key={item.key}>
                        <Card
                            hoverable
                            style={{
                                border: `1px solid ${token.colorBorderSecondary}`,
                                backgroundColor: itemBg,
                                borderRadius: token.borderRadiusLG,
                                overflow: 'hidden',
                                position: 'relative',
                                height: 160,
                                boxShadow: token.boxShadowTertiary,
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center'
                            }}
                            bodyStyle={{
                                padding: '16px',
                                width: '100%',
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: 'center',
                                textAlign: 'center'
                            }}
                        >
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 12, zIndex: 1 }}>
                                {/* Hexagon Icon container */}
                                <div style={{
                                    background: itemColor,
                                    color: '#fff',
                                    width: 48,
                                    height: 48,
                                    borderRadius: '50%', // Switch to circle for cleaner look without charts
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    fontSize: 20,
                                    marginBottom: 4,
                                    boxShadow: `0 4px 12px ${itemColor}40` // colored shadow
                                }}>
                                    {item.icon}
                                </div>

                                <div>
                                    <Text type="secondary" style={{ fontSize: 13, fontWeight: 500, color: token.colorTextSecondary, display: 'block', marginBottom: 4 }}>
                                        {item.label}
                                    </Text>
                                    <Title level={3} style={{ margin: 0, fontWeight: 800, fontSize: 24, lineHeight: 1.2 }}>
                                        {item.value}
                                    </Title>
                                    {item.isWarning && (
                                        <Text type="warning" style={{ fontSize: 12, marginTop: 4, display: 'block' }}>
                                            {lowStockCount} {t('lowStock')}
                                        </Text>
                                    )}
                                </div>
                            </div>
                        </Card>
                    </Col>
                );
            })}
        </Row>
    );
};
