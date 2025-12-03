import React from 'react';
import {
    CurrencyDollarIcon as DollarSign,
    ShoppingCartIcon as ShoppingCart,
    UsersIcon as Users,
    CubeIcon as Package,
    ExclamationTriangleIcon as AlertTriangle
} from '@heroicons/react/24/outline';

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
            return { text: t('outOfStock') || 'אזל מהמלאי', color: 'text-orange-600', bg: 'bg-orange-50' };
        }
        if (product.manage_stock && product.stock_quantity !== null) {
            return { text: `${product.stock_quantity} ${t('inStock') || 'במלאי'}`, color: 'text-orange-600', bg: 'bg-orange-50' };
        }
        return { text: t('lowStock') || 'מלאי נמוך', color: 'text-orange-600', bg: 'bg-orange-50' };
    };

    return (item, formatCurrency) => {
        switch (type) {
            case 'revenue':
            case 'orders':
            case 'recentOrders':
            case 'chartOrders':
                return (
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                                {t('order') || 'הזמנה'} #{item.id}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                <span className={`text-xs px-2 py-1 rounded-full ${item.status === 'completed' ? 'bg-green-50 text-green-600' :
                                    item.status === 'processing' ? 'bg-blue-50 text-blue-600' :
                                        'bg-gray-50 text-gray-600'
                                    } font-medium`}>
                                    {item.status || 'pending'}
                                </span>
                                <span className="text-xs text-gray-500">
                                    {new Date(item.date_created).toLocaleDateString('he-IL')}
                                </span>
                            </div>
                            <p className="text-sm font-semibold text-gray-900">
                                {formatCurrency(item.total)}
                            </p>
                        </div>
                    </div>
                );
            case 'customers':
                return (
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                            <div className="w-12 h-12 bg-primary-100 rounded-full flex items-center justify-center">
                                <Users className="w-5 h-5 text-primary-600" />
                            </div>
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 mb-1">
                                {item.first_name || item.last_name
                                    ? `${item.first_name || ''} ${item.last_name || ''}`.trim()
                                    : item.username || item.email || `${t('customer') || 'לקוח'} #${item.id}`}
                            </h3>
                            {item.email && (
                                <p className="text-xs text-gray-500 mb-1">{item.email}</p>
                            )}
                            {item.username && item.username !== item.email && (
                                <p className="text-xs text-gray-500 mb-1">@{item.username}</p>
                            )}
                            <div className="flex items-center gap-3 mt-2">
                                {item.orders_count !== undefined && (
                                    <span className="text-xs text-gray-600">
                                        {item.orders_count} {t('orders') || 'הזמנות'}
                                    </span>
                                )}
                                {item.total_spent !== undefined && item.total_spent > 0 && (
                                    <span className="text-xs text-gray-600">
                                        {formatCurrency(item.total_spent)} {t('totalSpent') || 'סה"כ הוצא'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
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
                    <div className="flex items-center gap-4 p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                        <div className="flex-shrink-0">
                            <img
                                src={imageUrl}
                                alt={item.name}
                                className="w-16 h-16 object-cover rounded-lg"
                                onError={(e) => {
                                    e.target.src = '/placeholder-product.png';
                                }}
                            />
                        </div>
                        <div className="flex-1 min-w-0">
                            <h3 className="text-sm font-medium text-gray-900 mb-1 truncate">
                                {item.name}
                            </h3>
                            <div className="flex items-center gap-2 mb-2">
                                {stockStatus ? (
                                    <span className={`text-xs px-2 py-1 rounded-full ${stockStatus.bg} ${stockStatus.color} font-medium`}>
                                        {stockStatus.text}
                                    </span>
                                ) : (
                                    <>
                                        {item.sold_quantity !== undefined && (
                                            <span className="text-xs text-gray-500">
                                                {t('sold') || 'נמכר'}: {item.sold_quantity}
                                            </span>
                                        )}
                                        {item.order_count !== undefined && (
                                            <span className="text-xs text-gray-500">
                                                {t('orders') || 'הזמנות'}: {item.order_count}
                                            </span>
                                        )}
                                    </>
                                )}
                                {item.sku && (
                                    <span className="text-xs text-gray-500">
                                        SKU: {item.sku}
                                    </span>
                                )}
                            </div>
                            {item.price && (
                                <p className="text-sm font-semibold text-gray-900">
                                    {formatCurrency(item.price)}
                                </p>
                            )}
                        </div>
                    </div>
                );
            default:
                return null;
        }
    };
};
