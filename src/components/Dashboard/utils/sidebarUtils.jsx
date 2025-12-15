import React from 'react';
import { Card, Space, Tag, Typography, Avatar } from 'antd';
import {
    DollarOutlined as DollarSign,
    ShoppingCartOutlined as ShoppingCart,
    UserOutlined as Users,
    InboxOutlined as Package,
    ExclamationCircleOutlined as AlertTriangle
} from '@ant-design/icons';

const { Text, Title } = Typography;

export const getSidebarTitle = (type, t, monthData) => {
    if (!type) return '';
    const titles = {
        revenue: t('totalRevenue') || 'סה"כ הכנסות',
        orders: t('totalOrders') || 'סה"כ הזמנות',
        customers: t('totalCustomers') || 'סה"כ לקוחות',
        products: t('totalProducts') || 'סה"כ מוצרים',
        recentOrders: t('recentOrders') || 'הזמנות אחרונות',
        chartOrders: monthData ? `${t('orders') || 'הזמנות'} - ${monthData.monthName}` : t('orders') || 'הזמנות',
        lowStock: t('lowStockProducts') || 'מוצרים במלאי נמוך',
    };
    return titles[type] || '';
};

export const getSidebarSubtitle = (type, t, stats, allOrders, allProducts, allCustomers, mostViewedProducts, mostOrderedProducts, mostSoldProducts, filteredOrders, lowStockProducts) => {
    if (!type) return '';
    const subtitles = {
        revenue: `${allOrders.filter(o => o.status === 'completed').length} ${t('completedOrders') || 'הזמנות הושלמו'}`,
        orders: `${allOrders.length} ${t('totalOrders') || 'הזמנות'}`,
        customers: `${allCustomers.length} ${t('customers') || 'לקוחות'}`,
        products: `${allProducts.length} ${t('products') || 'מוצרים'}`,
        recentOrders: `${allOrders.length} ${t('totalOrders') || 'הזמנות'}`,
        chartOrders: `${filteredOrders?.length || 0} ${t('orders') || 'הזמנות'}`,
        lowStock: `${lowStockProducts?.length || 0} ${t('products') || 'מוצרים'}`,
    };
    return subtitles[type] || '';
};

export const getSidebarIcon = (type) => {
    if (!type) return null;
    const icons = {
        revenue: DollarSign,
        orders: ShoppingCart,
        customers: Users,
        products: Package,
        recentOrders: ShoppingCart,
        chartOrders: ShoppingCart,
        lowStock: AlertTriangle,
    };
    return icons[type] || null;
};

export const getSidebarItems = (type, allOrders, allProducts, allCustomers, mostViewedProducts, mostOrderedProducts, mostSoldProducts, filteredOrders, lowStockProducts) => {
    if (!type) return [];
    switch (type) {
        case 'revenue':
            return allOrders.filter(o => o.status === 'completed');
        case 'orders':
            return allOrders;
        case 'customers':
            return allCustomers;
        case 'products':
            return allProducts;
        case 'recentOrders':
            return allOrders.slice(0, 50).sort((a, b) => new Date(b.date_created) - new Date(a.date_created));
        case 'chartOrders':
            return filteredOrders || [];
        case 'lowStock':
            return lowStockProducts || [];
        default:
            return [];
    }
};

export const getSidebarRenderItem = (type, t) => {
    if (!type) return () => null;

    // Helper for low stock status
    const getStockStatus = (product) => {
        if (product.stock_status === 'outofstock') {
            return { text: t('outOfStock') || 'אזל מהמלאי', color: 'error' };
        }
        if (product.manage_stock && product.stock_quantity !== null) {
            return { text: `${product.stock_quantity} ${t('inStock') || 'במלאי'}`, color: 'warning' };
        }
        return { text: t('lowStock') || 'מלאי נמוך', color: 'warning' };
    };

    return (item, formatCurrency) => {
        switch (type) {
            case 'revenue':
            case 'orders':
            case 'recentOrders':
            case 'chartOrders':
                const statusColors = {
                    completed: 'success',
                    processing: 'processing',
                    pending: 'default'
                };
                return (
                    <Card 
                        size="small" 
                        hoverable
                        style={{ marginBottom: 8 }}
                    >
                        <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                            <Text strong style={{ fontSize: 14 }}>
                                {t('order') || 'הזמנה'} #{item.id}
                            </Text>
                            <Space size={8}>
                                <Tag color={statusColors[item.status] || 'default'}>
                                    {item.status || 'pending'}
                                </Tag>
                                <Text type="secondary" style={{ fontSize: 12 }}>
                                    {new Date(item.date_created).toLocaleDateString('he-IL')}
                                </Text>
                            </Space>
                            <Text strong style={{ fontSize: 14 }}>
                                {formatCurrency(item.total)}
                            </Text>
                        </div>
                    </Card>
                );
            case 'customers':
                return (
                    <Card size="small" hoverable style={{ marginBottom: 8 }}>
                        <Space size={16} style={{ width: '100%' }}>
                            <Avatar 
                                size={48} 
                                icon={<Users />} 
                                style={{ backgroundColor: '#e6f4ff', color: '#1890ff', flexShrink: 0 }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
                                    {item.first_name || item.last_name
                                        ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                                        : item.username || item.email || `${t('customer') || 'לקוח'} #${item.id}`}
                                </Text>
                                {item.email && (
                                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
                                        {item.email}
                                    </Text>
                                )}
                                {item.username && item.username !== item.email && (
                                    <Text type="secondary" style={{ display: 'block', fontSize: 12, marginBottom: 4 }}>
                                        @{item.username}
                                    </Text>
                                )}
                                <Space size={12} style={{ marginTop: 8 }}>
                                    {item.orders_count !== undefined && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {item.orders_count} {t('orders') || 'הזמנות'}
                                        </Text>
                                    )}
                                    {item.total_spent !== undefined && item.total_spent > 0 && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            {formatCurrency(item.total_spent)} {t('totalSpent') || 'סה"כ הוצא'}
                                        </Text>
                                    )}
                                </Space>
                            </div>
                        </Space>
                    </Card>
                );
            case 'products':
            case 'topSellers':
            case 'mostOrdered':
            case 'mostSold':
            case 'lowStock':
                const imageUrl = item.images && item.images.length > 0
                    ? item.images[0].src
                    : '/placeholder-product.png';

                const stockStatus = type === 'lowStock' ? getStockStatus(item) : null;

                return (
                    <Card size="small" hoverable style={{ marginBottom: 8 }}>
                        <Space size={16} style={{ width: '100%' }}>
                            <img
                                src={imageUrl}
                                alt={item.name}
                                style={{ 
                                    width: 64, 
                                    height: 64, 
                                    objectFit: 'cover', 
                                    borderRadius: 8,
                                    flexShrink: 0
                                }}
                                onError={(e) => {
                                    e.target.src = '/placeholder-product.png';
                                }}
                            />
                            <div style={{ flex: 1, minWidth: 0 }}>
                                <Text strong style={{ display: 'block', marginBottom: 4, fontSize: 14 }}>
                                    {item.name}
                                </Text>
                                <Space size={8} wrap style={{ marginBottom: 8 }}>
                                    {stockStatus ? (
                                        <Tag color={stockStatus.color}>{stockStatus.text}</Tag>
                                    ) : (
                                        <>
                                            {item.sold_quantity !== undefined && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {t('sold') || 'נמכר'}: {item.sold_quantity}
                                                </Text>
                                            )}
                                            {item.order_count !== undefined && (
                                                <Text type="secondary" style={{ fontSize: 12 }}>
                                                    {t('orders') || 'הזמנות'}: {item.order_count}
                                                </Text>
                                            )}
                                        </>
                                    )}
                                    {item.sku && (
                                        <Text type="secondary" style={{ fontSize: 12 }}>
                                            SKU: {item.sku}
                                        </Text>
                                    )}
                                </Space>
                                {item.price && (
                                    <Text strong style={{ fontSize: 14 }}>
                                        {formatCurrency(item.price)}
                                    </Text>
                                )}
                            </div>
                        </Space>
                    </Card>
                );
            default:
                return null;
        }
    };
};
