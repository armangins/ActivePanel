import { useState, useEffect } from 'react';
import { Layout, Input, Alert, Segmented, Row, Col, Card, Pagination, Space, Select } from 'antd';
import { SearchOutlined, TableOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrdersData, useOrderStatusCounts } from '../hooks/useOrdersData';
import { OrdersTable } from './OrdersTable';
import { OrdersKanban } from './OrdersKanban';
import { OrderStatusCards } from './OrderStatusCards';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrderStatusFilter } from './OrderStatusFilter';
import { useSettings } from '@/features/settings';

const { Content } = Layout;

export const OrdersPage = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>('table');

    // Status filter state with localStorage persistence
    const [selectedStatuses, setSelectedStatuses] = useState<string[]>(() => {
        const saved = localStorage.getItem('orderStatusFilter');
        return saved ? JSON.parse(saved) : ['pending', 'processing', 'completed'];
    });

    useEffect(() => {
        localStorage.setItem('orderStatusFilter', JSON.stringify(selectedStatuses));
    }, [selectedStatuses]);

    // Sort state
    const [sortBy, setSortBy] = useState<string>('date-desc');

    const { data, isLoading, error } = useOrdersData({
        page,
        per_page: viewMode === 'kanban' ? 100 : 10, // Fetch more for kanban view
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

    // Sort orders
    const sortOrders = (orders: any[]) => {
        const sorted = [...orders];
        switch (sortBy) {
            case 'date-desc':
                return sorted.sort((a, b) => new Date(b.date_created).getTime() - new Date(a.date_created).getTime());
            case 'date-asc':
                return sorted.sort((a, b) => new Date(a.date_created).getTime() - new Date(b.date_created).getTime());
            case 'price-desc':
                return sorted.sort((a, b) => parseFloat(b.total) - parseFloat(a.total));
            case 'price-asc':
                return sorted.sort((a, b) => parseFloat(a.total) - parseFloat(b.total));
            default:
                return sorted;
        }
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
                    <Col xs={24}>
                        <Space style={{ width: '100%', justifyContent: 'space-between' }} size={16}>
                            <Input
                                placeholder={t('searchOrders')}
                                prefix={<SearchOutlined />}
                                value={search}
                                onChange={handleSearch}
                                allowClear
                                style={{ flex: 1, maxWidth: 400 }}
                            />
                            <Space>
                                <OrderStatusFilter
                                    selectedStatuses={selectedStatuses}
                                    onStatusChange={setSelectedStatuses}
                                />
                                <Select
                                    value={sortBy}
                                    onChange={setSortBy}
                                    style={{ width: 180 }}
                                    options={[
                                        { value: 'date-desc', label: t('newestFirst') || 'החדשים ראשון' },
                                        { value: 'date-asc', label: t('oldestFirst') || 'הישנים ראשון' },
                                        { value: 'price-desc', label: t('highestPrice') || 'מחיר גבוה-נמוך' },
                                        { value: 'price-asc', label: t('lowestPrice') || 'מחיר נמוך-גבוה' }
                                    ]}
                                />
                                <Segmented
                                    value={viewMode}
                                    onChange={(value) => setViewMode(value as 'table' | 'kanban')}
                                    options={[
                                        {
                                            label: t('tableView'),
                                            value: 'table',
                                            icon: <TableOutlined />
                                        },
                                        {
                                            label: t('kanbanView'),
                                            value: 'kanban',
                                            icon: <AppstoreOutlined />
                                        }
                                    ]}
                                />
                            </Space>
                        </Space>
                    </Col>
                </Row>
            </Card>

            <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                {viewMode === 'table' ? (
                    <OrdersTable
                        orders={sortOrders((data?.data || []).filter(order => selectedStatuses.includes(order.status)))}
                        isLoading={isLoading}
                        onViewDetails={(order) => setSelectedOrderId(order.id)}
                    />
                ) : (
                    <OrdersKanban
                        orders={sortOrders((data?.data || []).filter(order => selectedStatuses.includes(order.status)))}
                        isLoading={isLoading}
                        onViewDetails={(order) => setSelectedOrderId(order.id)}
                        visibleStatuses={selectedStatuses}
                    />
                )}
            </div>

            {viewMode === 'table' && data && data.total > 0 && (
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
