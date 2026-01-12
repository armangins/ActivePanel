import { useState, useEffect } from 'react';
import { Layout, Typography, Spin, Alert, Row, Col, Button, Result } from 'antd';
import { ReloadOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { useLanguage } from '@/contexts/LanguageContext';
import { useDashboardData } from '../hooks/useDashboardData';
import { StatsOverview } from './StatsOverview';
import { EarningsChart } from './EarningsChart';
import { RecentOrdersWidget } from './RecentOrdersWidget';
import { TopProductsWidget } from './TopProductsWidget';
import { useSettings } from '@/features/settings';

const { Content } = Layout;
const { Title } = Typography;

export const DashboardPage = () => {
    const { t } = useLanguage();
    const navigate = useNavigate();
    const { data, isLoading, error, refetch } = useDashboardData();
    const { settings, loading: settingsLoading } = useSettings();

    useEffect(() => {
        console.log('DashboardPage: Settings state:', { settings, settingsLoading });
    }, [settings, settingsLoading]);

    // Show loading state while checking configuration
    if (settingsLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100vh' }}>
                <Spin size="large" tip={t('loading') || 'טוען הגדרות...'} />
            </div>
        );
    }

    // Check configuration
    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    if (!isConfigured) {
        return (
            <Result
                status="warning"
                title={t('configureWooCommerceSettings') || 'Please configure WooCommerce Settings'}
                subTitle={t('welcomeToDashboard') || 'Welcome! Connect your store to see data.'}
                extra={
                    <Button type="primary" onClick={() => navigate('/settings')}>
                        {t('settings') || 'Go to Settings'}
                    </Button>
                }
            />
        );
    }

    if (isLoading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%' }}>
                <Spin size="large" tip={t('loading') || 'Loading Dashboard...'} />
            </div>
        );
    }

    if (error) {
        return (
            <Alert
                type="error"
                message="Error loading dashboard"
                description={error.message}
                action={
                    <Button size="small" icon={<ReloadOutlined />} onClick={() => refetch()}>
                        Retry
                    </Button>
                }
            />
        );
    }

    if (!data) return null;

    return (
        <Content>
            <div style={{ marginBottom: 24, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <Title level={2} style={{ margin: 0 }}>{t('dashboard') || 'Dashboard'}</Title>
                <Button icon={<ReloadOutlined />} onClick={() => refetch()}>
                    {t('refresh') || 'Refresh'}
                </Button>
            </div>

            <StatsOverview stats={data.stats} lowStockCount={data.lowStockCount} />

            <Row gutter={[16, 16]} style={{ marginTop: 24 }}>
                <Col xs={24} lg={16}>
                    <EarningsChart data={data.salesChartData} />
                </Col>
                <Col xs={24} lg={8}>
                    {/* Replaced RecentOrders with TopProducts or stack them? 
                        The user asked for Top Products feature. The layout usually fits 2 Columns.
                        Let's put TopProducts below EarningsChart or replace RecentOrders?
                        Top Products is usually a side widget.
                        I'll stack RecentOrders and TopProducts on the right column if there is space, 
                        or maybe put TopProducts in the right column and move RecentOrders to full width below?
                        Design-wise, TopProducts fits a narrow column.
                        Let's place TopProducts in the side column above RecentOrders.
                    */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 24 }}>
                        <TopProductsWidget products={data.topProducts} />
                        <RecentOrdersWidget orders={data.recentOrders} />
                    </div>
                </Col>
            </Row>
        </Content>
    );
};
