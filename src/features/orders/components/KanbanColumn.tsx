import React from 'react';
import { Typography, Tag, Space, Empty } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '../types';
import { KanbanCard } from './KanbanCard';
import './kanban.css';

const { Text } = Typography;

export interface StatusColumn {
    key: string;
    label: string;
    color: string;
}

interface KanbanColumnProps {
    column: StatusColumn;
    orders: Order[];
    draggedOrderId: string | undefined;
    dragOverColumn: string | null;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (columnKey: string) => void;
    onDragLeave: () => void;
    onDrop: (e: React.DragEvent, columnKey: string) => void;
    onDragStart: (e: React.DragEvent, order: Order) => void;
    onDragEnd: () => void;
    onViewDetails: (order: Order) => void;
}

export const KanbanColumn: React.FC<KanbanColumnProps> = ({
    column,
    orders,
    draggedOrderId,
    dragOverColumn,
    onDragOver,
    onDragEnter,
    onDragLeave,
    onDrop,
    onDragStart,
    onDragEnd,
    onViewDetails
}) => {
    const { t, isRTL } = useLanguage();
    const isOver = dragOverColumn === column.key;

    return (
        <div
            onDragOver={onDragOver}
            onDragEnter={() => onDragEnter(column.key)}
            onDragLeave={onDragLeave}
            onDrop={(e) => onDrop(e, column.key)}
            className={`kanban-column ${isOver ? 'is-over' : ''}`}
            style={{
                border: isOver ? `2px dashed ${column.color}` : '2px solid transparent'
            }}
        >
            {/* Column Header */}
            <div className="kanban-column-header">
                <Space>
                    <Tag
                        color={column.color}
                        className="kanban-column-count-tag"
                    >
                        {orders.length}
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

            {/* Order Cards Container */}
            <div className="kanban-cards-container">
                <div
                    className="kanban-cards-wrapper"
                    style={{ direction: isRTL ? 'rtl' : 'ltr' }}
                >
                    {orders.length === 0 ? (
                        <Empty
                            image={Empty.PRESENTED_IMAGE_SIMPLE}
                            description={t('noOrders') || 'אין הזמנות'}
                            style={{ padding: '24px 0' }}
                        />
                    ) : (
                        orders.map(order => (
                            <KanbanCard
                                key={order.id}
                                order={order}
                                columnColor={column.color}
                                isDragging={draggedOrderId === order.id}
                                onDragStart={onDragStart}
                                onDragEnd={onDragEnd}
                                onClick={onViewDetails}
                            />
                        ))
                    )}
                </div>
            </div>
        </div>
    );
};
