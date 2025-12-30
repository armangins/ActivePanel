import React, { memo, useState, useRef } from 'react';
import { Card, Typography } from 'antd';
import { useLanguage } from '@/contexts/LanguageContext';
import { Order } from '../types';
import './kanban.css';

const { Text } = Typography;

interface KanbanCardProps {
    order: Order;
    columnColor: string;
    isDragging: boolean;
    onDragStart: (e: React.DragEvent, order: Order) => void;
    onDragEnd: () => void;
    onClick: (order: Order) => void;
}

export const KanbanCard: React.FC<KanbanCardProps> = memo(({
    order,
    columnColor,
    isDragging,
    onDragStart,
    onDragEnd,
    onClick
}) => {
    const { t, formatCurrency } = useLanguage();
    const [wasDragged, setWasDragged] = useState(false);

    const firstItem = order.line_items?.[0];
    const productImage = firstItem?.image?.src;
    const productName = firstItem?.name || t('product');

    // Drag handlers
    const handleDragStart = (e: React.DragEvent) => {
        setWasDragged(true);
        onDragStart(e, order);
    };

    const handleDragEnd = () => {
        onDragEnd();
        // Reset after a short delay to allow click to be prevented
        setTimeout(() => setWasDragged(false), 100);
    };

    const handleClick = () => {
        if (!wasDragged) {
            onClick(order);
        }
    };

    return (
        <Card
            size="small"
            draggable
            onDragStart={handleDragStart}
            onDragEnd={handleDragEnd}
            onClick={handleClick}
            className={`kanban-card ${isDragging ? 'is-dragging' : ''}`}
            style={{
                borderRight: `4px solid ${columnColor}`,
            }}
            bodyStyle={{ padding: 16 }}
        >
            <div className="kanban-card-content">
                {/* Header Section */}
                <div className="kanban-card-header">
                    <div className="kanban-card-product-group">
                        {/* Product Image */}
                        <div
                            className="kanban-product-image"
                            style={{ backgroundImage: `url(${productImage})` }}
                        />

                        {/* Product Title & Price */}
                        <div className="kanban-product-info">
                            <Text strong className="kanban-product-name">
                                {productName}
                            </Text>
                            <Text className="kanban-product-price">
                                {formatCurrency(order.total)}
                            </Text>
                        </div>
                    </div>

                    {/* Order ID */}
                    <div className="kanban-order-id-group">
                        <Text strong style={{ display: 'block', fontSize: 12, marginBottom: 2 }}>מספר הזמנה</Text>
                        <Text style={{ fontSize: 12, color: '#595959' }}>#{order.id}</Text>
                    </div>
                </div>

                {/* Divider */}
                <div className="kanban-divider" />

                {/* Footer Section: Address & Date */}
                <div className="kanban-card-footer">
                    {/* Address */}
                    <div className="kanban-address-group">
                        <Text strong style={{ fontSize: 12, marginBottom: 4 }}>כתובת למשלוח</Text>
                        <Text style={{ fontSize: 11, color: '#8c8c8c', lineHeight: 1.3 }}>
                            {[
                                order.shipping?.address_1,
                                order.shipping?.city,
                                order.shipping?.state
                            ].filter(Boolean).join(', ')}
                        </Text>
                    </div>

                    {/* Date Block */}
                    <div className="kanban-date-block">
                        <Text className="kanban-date-day">
                            {new Date(order.date_created).getDate()}
                        </Text>
                        <Text className="kanban-date-month">
                            {new Date(order.date_created).toLocaleString('he-IL', { month: 'short' })}
                        </Text>
                    </div>
                </div>
            </div>
        </Card>
    );
});

KanbanCard.displayName = 'KanbanCard';
