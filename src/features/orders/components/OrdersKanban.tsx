import React, { useState } from 'react';
import { Card, Typography, Tag, Space, Empty, message } from 'antd';
import { DollarOutlined, UserOutlined, CalendarOutlined } from '@ant-design/icons';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpdateOrder } from '../hooks/useOrdersData';
import type { Order } from '../types';

const { Text } = Typography;

interface OrdersKanbanProps {
    orders: Order[];
    isLoading: boolean;
    onViewDetails: (order: Order) => void;
    visibleStatuses?: string[];
}

const STATUS_COLUMNS = [
    { key: 'pending', label: 'ממתין', color: '#faad14' },
    { key: 'processing', label: 'בטיפול', color: '#1890ff' },
    { key: 'on-hold', label: 'בהמתנה', color: '#722ed1' },
    { key: 'completed', label: 'הושלם', color: '#52c41a' },
    { key: 'cancelled', label: 'בוטל', color: '#ff4d4f' },
    { key: 'refunded', label: 'הוחזר', color: '#8c8c8c' }
];

export const OrdersKanban: React.FC<OrdersKanbanProps> = ({ orders, isLoading, onViewDetails, visibleStatuses }) => {
    const { t, formatCurrency } = useLanguage();
    const updateOrderMutation = useUpdateOrder();
    const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Use prop if provided, otherwise show all statuses
    const activeStatuses = visibleStatuses || STATUS_COLUMNS.map(col => col.key);

    const getOrdersByStatus = (status: string) => {
        return orders.filter(order => order.status === status);
    };

    const handleDragStart = (e: React.DragEvent, order: Order) => {
        setDraggedOrder(order);
        e.dataTransfer.effectAllowed = 'move';
    };

    const handleDragEnd = () => {
        setDraggedOrder(null);
        setDragOverColumn(null);
    };

    const handleDragOver = (e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    };

    const handleDrop = async (e: React.DragEvent, newStatus: string) => {
        e.preventDefault();
        setDragOverColumn(null);

        if (!draggedOrder || draggedOrder.status === newStatus) {
            setDraggedOrder(null);
            return;
        }

        const orderId = draggedOrder.id;

        try {
            await updateOrderMutation.mutateAsync(
                {
                    id: orderId,
                    status: newStatus
                },
                {
                    onError: () => {
                        message.error(t('orderStatusUpdateFailed') || 'שגיאה בעדכון סטטוס ההזמנה');
                    },
                    onSuccess: () => {
                        message.success(t('orderStatusUpdated') || 'סטטוס ההזמנה עודכן בהצלחה');
                    }
                }
            );
        } catch (error) {
            // Error already handled in onError
        }

        setDraggedOrder(null);
    };

    if (isLoading) {
        return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <>
            {/* Kanban Board */}
            <div style={{
                display: 'flex',
                gap: 16,
                overflowX: 'auto',
                padding: '16px 0',
                height: 'calc(100vh - 320px)',
                width: '100%'
            }}>
                {STATUS_COLUMNS.filter(col => activeStatuses.includes(col.key)).map(column => {
                    const columnOrders = getOrdersByStatus(column.key);
                    const isOver = dragOverColumn === column.key;
                    const visibleColumnsCount = activeStatuses.length;

                    // Calculate dynamic width: fill container evenly
                    const columnWidth = visibleColumnsCount > 0
                        ? `calc((100% - ${(visibleColumnsCount - 1) * 16}px) / ${visibleColumnsCount})`
                        : '300px';

                    return (
                        <div
                            key={column.key}
                            onDragOver={handleDragOver}
                            onDragEnter={() => setDragOverColumn(column.key)}
                            onDragLeave={() => setDragOverColumn(null)}
                            onDrop={(e) => handleDrop(e, column.key)}
                            style={{
                                width: columnWidth,
                                minWidth: 250,
                                flex: '1 1 0',
                                backgroundColor: isOver ? '#e6f7ff' : '#f5f5f5',
                                borderRadius: 8,
                                padding: 16,
                                border: isOver ? `2px dashed ${column.color}` : '2px solid transparent',
                                transition: 'all 0.2s',
                                display: 'flex',
                                flexDirection: 'column',
                                height: '100%'
                            }}
                        >
                            {/* Column Header - Fixed at top */}
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center',
                                marginBottom: 16,
                                flexShrink: 0
                            }}>
                                <Space>
                                    <Tag
                                        color={column.color}
                                        style={{
                                            minWidth: 32,
                                            height: 32,
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center',
                                            borderRadius: 8,
                                            fontSize: 14,
                                            fontWeight: 600,
                                            margin: 0
                                        }}
                                    >
                                        {columnOrders.length}
                                    </Tag>
                                    <Text strong>{column.label}</Text>
                                </Space>
                                <div style={{
                                    width: 8,
                                    height: 8,
                                    borderRadius: '50%',
                                    backgroundColor: column.color
                                }} />
                            </div>

                            {/* Order Cards - Scrollable container */}
                            <div style={{
                                display: 'flex',
                                flexDirection: 'column',
                                gap: 12,
                                overflowY: 'auto',
                                flex: 1, // Take remaining space
                                paddingRight: 4 // Space for scrollbar
                            }}>
                                {columnOrders.length === 0 ? (
                                    <Empty
                                        image={Empty.PRESENTED_IMAGE_SIMPLE}
                                        description={t('noOrders') || 'אין הזמנות'}
                                        style={{ padding: '24px 0' }}
                                    />
                                ) : (
                                    columnOrders.map(order => (
                                        <Card
                                            key={order.id}
                                            size="small"
                                            draggable
                                            onDragStart={(e) => handleDragStart(e, order)}
                                            onDragEnd={handleDragEnd}
                                            onClick={() => onViewDetails(order)}
                                            style={{
                                                cursor: 'grab',
                                                borderRight: `4px solid ${column.color}`,
                                                opacity: draggedOrder?.id === order.id ? 0.5 : 1,
                                                transform: draggedOrder?.id === order.id ? 'rotate(2deg)' : 'none',
                                                transition: 'all 0.2s',
                                                borderRadius: '8px 0 0 8px',
                                                boxShadow: '0 1px 2px rgba(0,0,0,0.05)'
                                            }}
                                            bodyStyle={{ padding: 16 }}
                                        >
                                            <Space direction="vertical" style={{ width: '100%' }} size={12}>
                                                {/* Header: Status Badge + Order Number */}
                                                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                                    <Tag
                                                        color={column.color}
                                                        style={{
                                                            margin: 0,
                                                            borderRadius: 12,
                                                            padding: '2px 10px',
                                                            fontSize: 11,
                                                            fontWeight: 500
                                                        }}
                                                    >
                                                        {column.label}
                                                    </Tag>
                                                    <Text strong style={{ fontSize: 15 }}>#{order.number}</Text>
                                                </div>

                                                {/* Customer Info */}
                                                <div style={{
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    padding: '8px 12px',
                                                    backgroundColor: '#fafafa',
                                                    borderRadius: 6
                                                }}>
                                                    <UserOutlined style={{ color: '#8c8c8c', fontSize: 14 }} />
                                                    <Text style={{ fontSize: 13, color: '#595959' }} ellipsis>
                                                        {order.billing?.first_name} {order.billing?.last_name}
                                                    </Text>
                                                </div>

                                                {/* Order Details Grid */}
                                                <div style={{
                                                    display: 'grid',
                                                    gridTemplateColumns: '1fr 1fr',
                                                    gap: 16
                                                }}>
                                                    {/* Total Amount */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <DollarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                                                            <Text type="secondary" style={{ fontSize: 11 }}>סכום</Text>
                                                        </div>
                                                        <Text strong style={{ fontSize: 16, color: '#52c41a' }}>
                                                            {formatCurrency(order.total)}
                                                        </Text>
                                                    </div>

                                                    {/* Date */}
                                                    <div style={{
                                                        display: 'flex',
                                                        flexDirection: 'column',
                                                        gap: 6
                                                    }}>
                                                        <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                                            <CalendarOutlined style={{ color: '#8c8c8c', fontSize: 12 }} />
                                                            <Text type="secondary" style={{ fontSize: 11 }}>תאריך</Text>
                                                        </div>
                                                        <Text style={{ fontSize: 13, color: '#595959', fontWeight: 500 }}>
                                                            {new Date(order.date_created).toLocaleDateString('he-IL', {
                                                                day: 'numeric',
                                                                month: 'short'
                                                            })}
                                                        </Text>
                                                    </div>
                                                </div>

                                                {/* Items Count */}
                                                {order.line_items && order.line_items.length > 0 && (
                                                    <div style={{
                                                        display: 'flex',
                                                        alignItems: 'center',
                                                        gap: 6,
                                                        paddingTop: 8,
                                                        borderTop: '1px solid #f0f0f0'
                                                    }}>
                                                        <div style={{
                                                            width: 6,
                                                            height: 6,
                                                            borderRadius: '50%',
                                                            backgroundColor: '#d9d9d9'
                                                        }} />
                                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                                            {order.line_items.length} {order.line_items.length === 1 ? 'פריט' : 'פריטים'}
                                                        </Text>
                                                    </div>
                                                )}
                                            </Space>
                                        </Card>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </>
    );
};
