import { memo } from 'react';
import { InboxOutlined as Package, SearchOutlined as Search } from '@ant-design/icons';
import { OptimizedImage, Button } from '../ui';

/**
 * OrderRow Component
 * 
 * Individual row in the orders table matching the design:
 * Product (with image), Order ID, Price, Quantity, Payment, Status, Tracking
 * 
 * @param {Object} order - Order object
 * @param {Number} index - Row index for alternating background
 * @param {Function} onViewDetails - Callback when viewing order details
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderRow = memo(({ order, index, onViewDetails, onStatusUpdate, formatCurrency, isRTL, t }) => {
  // Get first product image from line items
  const firstItem = order.line_items?.[0];
  const productImage = firstItem?.image?.src || null;
  const productName = firstItem?.name || t('product') || 'מוצר';

  // Get customer name
  const customerName = order.billing?.first_name && order.billing?.last_name
    ? `${order.billing.first_name} ${order.billing.last_name}`
    : order.billing?.first_name || order.billing?.last_name || order.billing?.email || t('customer') || 'לקוח';

  // Calculate total quantity
  const totalQuantity = order.line_items?.reduce((sum, item) => sum + (parseInt(item.quantity || 0, 10)), 0) || 0;

  // Get order number
  const orderNumber = order.number || `#${order.id}`;

  // Status badge styling
  const getStatusStyle = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-50 text-green-700 border border-green-200';
      case 'pending':
        return 'bg-gray-100 text-gray-700 border border-gray-200';
      case 'processing':
        return 'bg-blue-50 text-blue-700 border border-blue-200';
      case 'cancelled':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      case 'on-hold':
        return 'bg-yellow-50 text-yellow-700 border border-yellow-200';
      case 'refunded':
        return 'bg-orange-50 text-orange-700 border border-orange-200';
      default:
        return 'bg-gray-100 text-gray-700 border border-gray-200';
    }
  };

  const getStatusLabel = (status) => {
    switch (status) {
      case 'completed':
        return t('success') || 'Success' || 'הצלחה';
      case 'pending':
        return t('pending') || 'Pending' || 'ממתין';
      case 'processing':
        return t('processing') || 'Processing' || 'מעבד';
      case 'cancelled':
        return t('cancel') || 'Cancel' || 'בוטל';
      case 'on-hold':
        return t('onHold') || 'On Hold' || 'מושהה';
      case 'refunded':
        return t('refunded') || 'Refunded' || 'הוחזר';
      default:
        return status;
    }
  };

  // Payment method/status
  const paymentMethod = order.payment_method_title || order.payment_method || t('payment') || 'תשלום';
  const paymentStatus = order.payment_status || 'pending';

  // Alternating row background
  const rowBgClass = index % 2 === 0 ? 'bg-white' : 'bg-gray-50';

  return (
    <tr className={`${rowBgClass} hover:bg-gray-100 transition-colors cursor-pointer`} onClick={() => onViewDetails(order)}>
      {/* Product Column */}
      <td className="py-4 px-6">
        <div className="flex items-center gap-3 flex-row">
          <div className="flex-shrink-0 w-12 h-12 bg-gray-100 rounded-lg overflow-hidden flex items-center justify-center relative">
            {productImage ? (
              <OptimizedImage
                src={productImage}
                alt={productName}
                className="w-full h-full object-cover"
              />
            ) : (
              <Package className="w-5 h-5 text-gray-400" />
            )}
          </div>
          <div className={`flex-1 min-w-0 ${isRTL ? 'text-right' : 'text-left'}`}>
            <p className="text-sm font-medium text-gray-900 truncate">
              {customerName}
            </p>
            <p className="text-xs text-gray-500 truncate">
              {productName}
            </p>
          </div>
        </div>
      </td>

      {/* Order ID Column */}
      <td className={`py-4 px-6 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
        {orderNumber}
      </td>

      {/* Price Column */}
      <td className={`py-4 px-6 text-sm font-medium text-gray-900 ${isRTL ? 'text-right' : 'text-left'}`}>
        {formatCurrency(parseFloat(order.total || 0))}
      </td>

      {/* Quantity Column */}
      <td className={`py-4 px-6 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
        {totalQuantity.toLocaleString()}
      </td>

      {/* Payment Column */}
      <td className={`py-4 px-6 text-sm text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
        <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${paymentStatus === 'paid' || paymentStatus === 'completed'
          ? 'bg-blue-50 text-blue-700'
          : 'bg-gray-100 text-gray-700'
          }`}>
          {paymentMethod}
        </span>
      </td>

      {/* Status Column */}
      <td className={`py-4 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <span className={`inline-flex items-center px-3 py-1 rounded-full text-xs font-medium ${getStatusStyle(order.status)}`}>
          {getStatusLabel(order.status)}
        </span>
      </td>

      {/* Tracking Column */}
      <td className={`py-4 px-6 ${isRTL ? 'text-right' : 'text-left'}`}>
        <Button
          onClick={(e) => {
            e.stopPropagation();
            onViewDetails(order);
          }}
          variant="primary"
          className="flex items-center gap-2"
        >
          <Search className="w-4 h-4" />
          <span>{t('viewDetails') || 'צפה בפרטים'}</span>
        </Button>
      </td>
    </tr>
  );
});

OrderRow.displayName = 'OrderRow';

export default OrderRow;
