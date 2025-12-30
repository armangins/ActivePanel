import { useState, useEffect, useMemo } from 'react';
import { Layout, Alert, Card, Pagination } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useOrdersData, useOrderStatusCounts } from '../hooks/useOrdersData';
import { OrdersTable } from './OrdersTable';
import { OrdersKanban } from './OrdersKanban';
import { OrderStatusCards } from './OrderStatusCards';
import { OrderDetailsModal } from './OrderDetailsModal';
import { OrdersControls } from './OrdersControls';
import { useSettings } from '@/features/settings';

const { Content } = Layout;

export const OrdersPage = () => {
    const { t } = useLanguage();
    const { settings } = useSettings();
    const [page, setPage] = useState(1);
    const [status, setStatus] = useState('all');
    const [search, setSearch] = useState('');
    const [selectedOrderId, setSelectedOrderId] = useState<number | null>(null);

    // Default to Kanban on mobile (< 768px), Table on desktop
    const [viewMode, setViewMode] = useState<'table' | 'kanban'>(() => {
        return window.innerWidth < 768 ? 'kanban' : 'table';
    });

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
        per_page: viewMode === 'kanban' ? 100 : 10,
        search,
        status: status === 'all' ? undefined : status
    });

    const { data: statusCounts } = useOrderStatusCounts();

    const isConfigured = !!(settings?.hasConsumerKey && settings?.hasConsumerSecret);

    // Memoize sorted orders to prevent unnecessary re-sorting
    // Moved before isConfigured check to prevent "Rendered more hooks" error
    const sortedOrders = useMemo(() => {
        const orders = (data?.data || []).filter(order => selectedStatuses.includes(order.status));
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
    }, [data?.data, selectedStatuses, sortBy]);

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
                <OrdersControls
                    search={search}
                    onSearchChange={handleSearch}
                    selectedStatuses={selectedStatuses}
                    onStatusChange={setSelectedStatuses}
                    sortBy={sortBy}
                    onSortChange={setSortBy}
                    viewMode={viewMode}
                    onViewModeChange={setViewMode}
                />
            </Card>

            <div style={{ marginTop: 24, backgroundColor: '#fff', borderRadius: 8, overflow: 'hidden' }}>
                {viewMode === 'table' ? (
                    <OrdersTable
                        orders={sortedOrders}
                        isLoading={isLoading}
                        onViewDetails={(order) => setSelectedOrderId(order.id)}
                    />
                ) : (
                    <OrdersKanban
                        orders={sortedOrders}
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
