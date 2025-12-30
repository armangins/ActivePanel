import React, { useState, useCallback } from 'react';
import { message } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { useUpdateOrder } from '../hooks/useOrdersData';
import type { Order } from '../types';
import { KanbanColumn, StatusColumn } from './KanbanColumn';
import './kanban.css';

interface OrdersKanbanProps {
    orders: Order[];
    isLoading: boolean;
    onViewDetails: (order: Order) => void;
    visibleStatuses?: string[];
}

const STATUS_COLUMNS: StatusColumn[] = [
    { key: 'pending', label: 'ממתין', color: '#F59E0B' }, // Warning orange
    { key: 'processing', label: 'בטיפול', color: '#3B82F6' }, // Primary blue
    { key: 'on-hold', label: 'בהמתנה', color: '#8B5CF6' }, // Purple
    { key: 'completed', label: 'הושלם', color: '#10B981' }, // Success green
    { key: 'cancelled', label: 'בוטל', color: '#EF4444' }, // Error red
    { key: 'refunded', label: 'הוחזר', color: '#6B7280' } // Gray
];

export const OrdersKanban: React.FC<OrdersKanbanProps> = ({ orders, isLoading, onViewDetails, visibleStatuses }) => {
    const { t, isRTL } = useLanguage();
    const updateOrderMutation = useUpdateOrder();
    const [draggedOrder, setDraggedOrder] = useState<Order | null>(null);
    const [dragOverColumn, setDragOverColumn] = useState<string | null>(null);

    // Use prop if provided, otherwise show all statuses
    const activeStatuses = visibleStatuses || STATUS_COLUMNS.map(col => col.key);

    const getOrdersByStatus = useCallback((status: string) => {
        return orders.filter(order => order.status === status);
    }, [orders]);

    const handleDragStart = useCallback((e: React.DragEvent, order: Order) => {
        setDraggedOrder(order);
        e.dataTransfer.effectAllowed = 'move';
    }, []);

    const handleDragEnd = useCallback(() => {
        setDraggedOrder(null);
        setDragOverColumn(null);
    }, []);

    const handleDragOver = useCallback((e: React.DragEvent) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = 'move';
    }, []);

    const handleDrop = useCallback(async (e: React.DragEvent, newStatus: string) => {
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
    }, [draggedOrder, updateOrderMutation, t]);

    if (isLoading) {
        return <div style={{ padding: 24, textAlign: 'center' }}>Loading...</div>;
    }

    return (
        <div
            className="kanban-board-container"
            style={{ direction: isRTL ? 'rtl' : 'ltr' }}
        >
            {STATUS_COLUMNS.filter(col => activeStatuses.includes(col.key)).map(column => (
                <KanbanColumn
                    key={column.key}
                    column={column}
                    orders={getOrdersByStatus(column.key)}
                    draggedOrderId={draggedOrder?.id}
                    dragOverColumn={dragOverColumn}
                    onDragOver={handleDragOver}
                    onDragEnter={setDragOverColumn}
                    onDragLeave={() => setDragOverColumn(null)}
                    onDrop={handleDrop}
                    onDragStart={handleDragStart}
                    onDragEnd={handleDragEnd}
                    onViewDetails={onViewDetails}
                />
            ))}
        </div>
    );
};
