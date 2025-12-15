import { useOrders } from '../../../hooks/useOrders';
import { format } from 'date-fns';
import { ShoppingOutlined as ShoppingBag, TruckOutlined as Truck, PictureOutlined as Photo } from '@ant-design/icons';
import { OptimizedImage } from '../../ui';

/**
 * CustomerDetailsOrders Component
 * 
 * Displays a list of orders for the customer, including product images.
 * 
 * @param {Object} customer - Customer object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 * @param {Function} formatCurrency - Function to format currency
 */
const CustomerDetailsOrders = ({ customer, isRTL, t, formatCurrency }) => {
    const { data: ordersData, isLoading } = useOrders({
        customer: customer.id,
        per_page: 10, // Load last 10 orders
        fields: ['id', 'status', 'total', 'date_created', 'currency', 'line_items', 'shipping_lines'],
    });

    if (isLoading) {
        return (
            <div className="bg-white border border-gray-200 rounded-lg p-4 animate-pulse">
                <div className="h-6 bg-gray-200 rounded w-1/4 mb-4 ml-auto"></div>
                <div className="space-y-4">
                    {[1, 2, 3].map(i => (
                        <div key={i} className="h-24 bg-gray-100 rounded"></div>
                    ))}
                </div>
            </div>
        );
    }

    if (!ordersData?.data?.length) {
        return null;
    }

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-4">
            <h3 className={`text-sm font-medium text-gray-700 mb-4 ${'text-right'}`}>
                {t('orderHistory') || 'Order History'}
            </h3>

            <div className="space-y-6">
                {ordersData.data.map(order => {
                    const shippingMethod = order.shipping_lines?.[0]?.method_title;

                    return (
                        <div key={order.id} className="border border-gray-100 rounded-lg p-4 hover:bg-gray-50 transition-colors">
                            {/* Order Header */}
                            <div className={`flex items-start justify-between mb-3 ${'flex-row-reverse'}`}>
                                <div className={`flex flex-col ${'items-end'}`}>
                                    <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                                        <ShoppingBag className="w-4 h-4 text-gray-400" />
                                        <span className="font-medium text-gray-900">#{order.id}</span>
                                    </div>
                                    <span className="text-xs text-gray-500 mt-1">
                                        {format(new Date(order.date_created), 'MMM d, yyyy h:mm a')}
                                    </span>
                                </div>

                                <div className={`flex flex-col ${'items-start'}`}>
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${order.status === 'completed' ? 'bg-green-100 text-green-800' :
                                        order.status === 'processing' ? 'bg-blue-100 text-blue-800' :
                                            order.status === 'cancelled' ? 'bg-red-100 text-red-800' :
                                                'bg-gray-100 text-gray-800'
                                        }`}>
                                        {order.status}
                                    </span>
                                    <span className="text-sm font-semibold text-gray-900 mt-1">
                                        {formatCurrency ? formatCurrency(order.total) : order.total}
                                    </span>
                                </div>
                            </div>

                            {/* Shipping Method */}
                            {shippingMethod && (
                                <div className={`flex items-center gap-2 text-xs text-gray-600 mb-3 ${'flex-row-reverse'}`}>
                                    <Truck className="w-3.5 h-3.5 text-gray-400" />
                                    <span className="font-medium">{t('shippingMethod') || 'Shipping'}:</span>
                                    <span>{shippingMethod}</span>
                                </div>
                            )}

                            {/* Product Images (Scrollable) */}
                            {order.line_items?.length > 0 && (
                                <div className={`flex gap-2 overflow-x-auto pb-2 scrollbar-hide ${'flex-row-reverse'}`}>
                                    {order.line_items.map(item => (
                                        <div key={item.id} className="flex-shrink-0 relative group">
                                            <div className="w-16 h-16 rounded-md border border-gray-200 overflow-hidden bg-white relative">
                                                {item.image?.src ? (
                                                    <OptimizedImage
                                                        src={item.image.src}
                                                        alt={item.name}
                                                        className="w-full h-full object-cover"
                                                    />
                                                ) : (
                                                    <div className="w-full h-full flex items-center justify-center bg-gray-50">
                                                        <Photo className="w-6 h-6 text-gray-300" />
                                                    </div>
                                                )}
                                            </div>
                                            {/* Tooltip */}
                                            <div className="absolute bottom-full mb-2 left-1/2 transform -translate-x-1/2 bg-gray-900 text-white text-xs py-1 px-2 rounded opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none z-10">
                                                {item.name} x{item.quantity}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    );
                })}
            </div>
        </div>
    );
};

export default CustomerDetailsOrders;
