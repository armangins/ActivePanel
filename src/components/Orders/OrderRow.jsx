import { format } from 'date-fns';
import { Eye } from 'lucide-react';

/**
 * OrderRow Component
 * 
 * Individual row in the orders table displaying order information.
 * 
 * @param {Object} order - Order object
 * @param {Function} onViewDetails - Callback when viewing order details
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} getStatusColor - Function to get status color classes
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderRow = ({ order, onViewDetails, onStatusUpdate, formatCurrency, getStatusColor, isRTL, t }) => {
  return (
    <tr className="border-b border-gray-100 hover:bg-gray-50">
      <td className="py-3 px-4">
        <div>
          <p className="text-sm font-medium text-gray-900">#{order.id}</p>
          <p className="text-xs text-gray-500">
            {order.line_items?.length || 0} {t('items')}
          </p>
        </div>
      </td>
      <td className={`py-3 px-4 text-sm text-gray-700 ${'text-right'}`}>
        {format(new Date(order.date_created), 'MMM dd, yyyy HH:mm')}
      </td>
      <td className="py-3 px-4">
        <div>
          <p className="text-sm text-gray-900">
            {order.billing?.first_name} {order.billing?.last_name}
          </p>
          <p className="text-xs text-gray-500">{order.billing?.email}</p>
        </div>
      </td>
      <td className="py-3 px-4">
        <select
          value={order.status}
          onChange={(e) => onStatusUpdate(order.id, e.target.value)}
          className={`text-xs font-medium rounded-full px-3 py-1 border-0 ${getStatusColor(order.status)} cursor-pointer`}
          style={order.status === 'processing' ? { backgroundColor: '#EBF3FF' } : {}}
          dir="rtl"
        >
          <option value="pending">{t('pending')}</option>
          <option value="processing">{t('processing')}</option>
          <option value="on-hold">{t('onHold')}</option>
          <option value="completed">{t('completed')}</option>
          <option value="cancelled">{t('cancelled')}</option>
          <option value="refunded">{t('refunded')}</option>
        </select>
      </td>
      <td className="py-3 px-4">
        <span
          className={`inline-flex items-center px-2 py-1 text-xs font-medium rounded ${
            order.payment_status === 'paid' || order.payment_status === 'completed'
              ? 'text-primary-500'
              : order.payment_status === 'pending'
              ? 'bg-yellow-100 text-yellow-800'
              : order.payment_status === 'failed'
              ? 'bg-red-100 text-red-800'
              : 'bg-gray-100 text-gray-800'
          }`}
          style={
            order.payment_status === 'paid' || order.payment_status === 'completed'
              ? { backgroundColor: '#EBF3FF' }
              : {}
          }
        >
          {order.payment_method_title || 
           (order.payment_status === 'paid' || order.payment_status === 'completed' 
             ? t('paid') || 'Paid' 
             : order.payment_status === 'pending' 
             ? t('pendingPayment') || 'Pending'
             : order.payment_status === 'failed'
             ? t('failed') || 'Failed'
             : t('unpaid') || 'Unpaid')}
        </span>
      </td>
      <td className={`py-3 px-4 text-sm font-medium text-gray-900 ${'text-right'}`}>
        {formatCurrency(parseFloat(order.total || 0))}
      </td>
      <td className={`py-3 px-4 ${'text-right'}`}>
        <button
          onClick={() => onViewDetails(order)}
          className="p-2 text-primary-500 hover:bg-primary-50 rounded-lg transition-colors"
          title={t('viewDetails')}
        >
          <Eye size={18} />
        </button>
      </td>
    </tr>
  );
};

export default OrderRow;

