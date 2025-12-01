import { memo } from 'react';
import OrderRow from './OrderRow';

/**
 * OrdersTable Component
 * 
 * Table displaying orders with columns matching the design:
 * Product, Order ID, Price, Quantity, Payment, Status, Tracking
 * 
 * @param {Array} orders - Array of order objects
 * @param {Function} onViewDetails - Callback when viewing order details
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrdersTable = memo(({ orders, onViewDetails, onStatusUpdate, formatCurrency, isRTL, t }) => {
  return (
    <div className="card overflow-hidden">
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-gray-200 bg-gray-50">
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('product') || 'מוצר'}
              </th>
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('orderId') || 'מספר הזמנה'}
              </th>
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('price') || 'מחיר'}
              </th>
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('quantity') || 'כמות'}
              </th>
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('payment') || 'תשלום'}
              </th>
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('status') || 'סטטוס'}
              </th>
              <th className={`py-4 px-6 text-sm font-semibold text-gray-700 ${isRTL ? 'text-right' : 'text-left'}`}>
                {t('tracking') || 'מעקב'}
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {orders.map((order, index) => (
              <OrderRow
                key={order.id}
                order={order}
                index={index}
                onViewDetails={onViewDetails}
                onStatusUpdate={onStatusUpdate}
                formatCurrency={formatCurrency}
                isRTL={isRTL}
                t={t}
              />
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
});

OrdersTable.displayName = 'OrdersTable';

export default OrdersTable;
