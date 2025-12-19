import { Card, Col, Row, Statistic } from 'antd';
import {
    DollarOutlined,
    ShoppingCartOutlined,
    UserOutlined,
    AppstoreOutlined,
    ArrowUpOutlined,
    ArrowDownOutlined
} from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { DashboardStats } from '../types';

interface StatsOverviewProps {
    stats: DashboardStats;
    lowStockCount?: number;
}

export const StatsOverview = ({ stats, lowStockCount }: StatsOverviewProps) => {
    const { t } = useLanguage();

    // Mapping for cards
    // We could pass 'changes' prop if we calculated percentage changes in service
    // For now simpler version based on legacy

    return (
        <Row gutter={[16, 16]}>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false}>
                    <Statistic
                        title={t('totalRevenue') || 'Total Revenue'}
                        value={stats.totalRevenue}
                        prefix={<DollarOutlined />}
                        precision={2}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false}>
                    <Statistic
                        title={t('totalOrders') || 'Total Orders'}
                        value={stats.totalOrders}
                        prefix={<ShoppingCartOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false}>
                    <Statistic
                        title={t('totalCustomers') || 'Total Customers'}
                        value={stats.totalCustomers}
                        prefix={<UserOutlined />}
                    />
                </Card>
            </Col>
            <Col xs={24} sm={12} lg={6}>
                <Card bordered={false}>
                    <Statistic
                        title={t('totalProducts') || 'Total Products'}
                        value={stats.totalProducts}
                        prefix={<AppstoreOutlined />}
                        // Show low stock warning if needed
                        suffix={lowStockCount && lowStockCount > 0 ? (
                            <span style={{ fontSize: 12, color: '#faad14', marginLeft: 8 }}>
                                {lowStockCount} {t('lowStock') || 'Low Stock'}
                            </span>
                        ) : null}
                    />
                </Card>
            </Col>
        </Row>
    );
};
