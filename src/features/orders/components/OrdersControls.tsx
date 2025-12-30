import React from 'react';
import { Row, Col, Input, Dropdown, Button, Select, Segmented, Grid } from 'antd';
import { SearchOutlined, UnorderedListOutlined, AppstoreOutlined, SortAscendingOutlined, FilterOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { OrderStatusFilter } from './OrderStatusFilter';

interface OrdersControlsProps {
    search: string;
    onSearchChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    selectedStatuses: string[];
    onStatusChange: (statuses: string[]) => void;
    sortBy: string;
    onSortChange: (value: string) => void;
    viewMode: 'table' | 'kanban';
    onViewModeChange: (value: 'table' | 'kanban') => void;
}

export const OrdersControls: React.FC<OrdersControlsProps> = ({
    search,
    onSearchChange,
    selectedStatuses,
    onStatusChange,
    sortBy,
    onSortChange,
    viewMode,
    onViewModeChange
}) => {
    const { t } = useLanguage();
    const screens = Grid.useBreakpoint();

    return (
        <Row gutter={[16, 16]} align="middle">
            {screens.md && (
                <Col xs={24} md={10} lg={8}>
                    <Input
                        placeholder={t('searchOrders')}
                        prefix={<SearchOutlined />}
                        value={search}
                        onChange={onSearchChange}
                        allowClear
                        style={{ width: '100%' }}
                    />
                </Col>
            )}
            <Col xs={24} md={14} lg={16}>
                <div style={{
                    display: 'flex',
                    justifyContent: !screens.md ? 'space-between' : 'flex-end',
                    alignItems: 'center',
                    gap: '8px',
                    flexWrap: 'wrap',
                    width: '100%'
                }}>
                    <div style={{ display: 'flex', gap: '8px', alignItems: 'center' }}>
                        <OrderStatusFilter
                            selectedStatuses={selectedStatuses}
                            onStatusChange={onStatusChange}
                        />

                        {/* Sort Control */}
                        {!screens.md ? (
                            <Dropdown
                                menu={{
                                    items: [
                                        { key: 'date-desc', label: t('newestFirst') || 'החדשים ראשון' },
                                        { key: 'date-asc', label: t('oldestFirst') || 'הישנים ראשון' },
                                        { key: 'price-desc', label: t('highestPrice') || 'מחיר גבוה-נמוך' },
                                        { key: 'price-asc', label: t('lowestPrice') || 'מחיר נמוך-גבוה' }
                                    ],
                                    onClick: ({ key }) => onSortChange(key),
                                    selectedKeys: [sortBy]
                                }}
                                trigger={['click']}
                            >
                                <Button icon={<SortAscendingOutlined />} style={{ minHeight: 32 }} />
                            </Dropdown>
                        ) : (
                            <Select
                                value={sortBy}
                                onChange={onSortChange}
                                style={{ width: 160 }}
                                options={[
                                    { value: 'date-desc', label: t('newestFirst') || 'החדשים ראשון' },
                                    { value: 'date-asc', label: t('oldestFirst') || 'הישנים ראשון' },
                                    { value: 'price-desc', label: t('highestPrice') || 'מחיר גבוה-נמוך' },
                                    { value: 'price-asc', label: t('lowestPrice') || 'מחיר נמוך-גבוה' }
                                ]}
                            />
                        )}
                    </div>

                    {/* View Mode Control */}
                    <Segmented
                        value={viewMode}
                        onChange={(value) => onViewModeChange(value as 'table' | 'kanban')}
                        options={[
                            {
                                label: screens.md ? (t('tableView') || 'Table') : null,
                                value: 'table',
                                icon: <UnorderedListOutlined />
                            },
                            {
                                label: screens.md ? (t('kanbanView') || 'Kanban') : null,
                                value: 'kanban',
                                icon: <AppstoreOutlined />
                            }
                        ]}
                    />
                </div>
            </Col>
        </Row>
    );
};
