import { format } from 'date-fns';
import { Eye } from 'lucide-react';
import OrderRow from './OrderRow';

/**
 * OrdersTable Component
 * 
 * Table displaying orders with columns for order info, date, customer, status, total, and actions.
 * 
 * @param {Array} orders - Array of order objects
 * @param {Function} onViewDetails - Callback when viewing order details
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrdersTable = ({ orders, onViewDetails, onStatusUpdate, formatCurrency, isRTL, t }) => {
  const getStatusColor = (status) => {
    switch (status) {
      case 'completed':
        return 'bg-green-100 text-green-800';
      case 'processing':
        return 'text-primary-500';
      case 'pending':
        return 'bg-yellow-100 text-yellow-800';
      case 'on-hold':
        return 'bg-orange-100 text-orange-800';
      case 'cancelled':
        return 'bg-red-100 text-red-800';
      case 'refunded':
        return 'bg-gray-100 text-gray-800';
      default:
        return 'bg-gray-100 text-gray-800';
    }
  };

  return (
    <div className="card">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200">
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('order')}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('date')}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('customer')}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('status')}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('paymentStatus') || 'Payment'}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('total')}
              </th>
              <th className={`py-3 px-4 text-sm font-medium text-gray-700 ${'text-right'}`}>
                {t('actions')}
              </th>
            </tr>
          </thead>
          <tbody>
            {orders.map((order) => (
              <OrderRow
                key={order.id}
                order={order}
                onViewDetails={onViewDetails}
                onStatusUpdate={onStatusUpdate}
                formatCurrency={formatCurrency}
                getStatusColor={getStatusColor}
                isRTL={isRTL}
                t={t}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default OrdersTable;

