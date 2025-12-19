import { useState } from 'react';
import { Layout, Input, Alert, Select, Row, Col, Card, Pagination } from 'antd';
import { SearchOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrdersData, useOrderStatusCounts } from '../hooks/useOrdersData';
import { OrdersTable } from './OrdersTable';
import { OrderStatusCards } from './OrderStatusCards';
import { OrderDetailsModal } from './OrderDetailsModal';
import { useSettings } from '@/features/settings';

const { Content } = Layout;

export const OrdersPage = () => {
    const { t, isRTL } = useLanguage();
    const { settings } = useSettings();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    const { data, isLoading, error } = useOrdersData({
        page,
        per_page: 10,
        search,
        status: status === 'all' ? undefined : status
    });

    const { data: statusCounts } = useOrderStatusCounts();

    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    if (!isConfigured) {
        return <Alert type="warning" message={t('configureSettingsFirst')} />;
    }

    const handleSearch = (e: React.ChangeEvent<HTMLInputElement>) => {
        setSearch(e.target.value);
        setPage(1);
    };

    return (
        <Content>
            {error && (
                <Alert type="error" message={error.message} style={{ marginBottom: 24 }} />
            )}

            <OrderStatusCards
                statusCounts={statusCounts || {}}
                onStatusClick={setStatus}
                selectedStatus={status}
            />

            <Card style={{ marginTop: 24 }}>
                <Row gutter={[16, 16]} align="middle">
                    <Col xs={24} md={12}>
                        <Input
                            placeholder={t('searchOrders')}
                            prefix={<SearchOutlined />}
                            value={search}
                            onChange={handleSearch}
                            allowClear
                        />
                    </Col>
                    <Col xs={24} md={12} style={{ textAlign: isRTL ? 'left' : 'right' }}>
                        {/* Filter controls if needed */}
                    </Col>
                </Row>
            </Card>

            <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                <OrdersTable
                    orders={data?.data || []}
                    isLoading={isLoading}
                    onViewDetails={(order) => setSelectedOrderId(order.id)}
                />
            </div>

            {data && data.total > 0 && (
                <div style={{ marginTop: 24, textAlign: 'center' }}>
                    <Pagination
                        current={page}
                        total={data.total}
                        pageSize={10}
                        onChange={setPage}
                        showSizeChanger={false}
                    />
                </div>
            )}

            <OrderDetailsModal
                orderId={selectedOrderId}
                onClose={() => setSelectedOrderId(null)}
            />
        </Content>
    );
};
