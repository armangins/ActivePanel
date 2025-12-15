/**
 * OrderDetailsStatus Component
 * 
 * Displays and allows editing of order status.
 * 
 * @param {Object} order - Order object
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsStatus = ({ order, onStatusUpdate, isRTL, t }) => {
  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <label className={`block text-sm font-medium text-gray-700 mb-2 ${'text-right'}`}>
        {t('orderStatus')}
      </label>
      <select
        value={order.status}
        onChange={(e) => onStatusUpdate(order.id, e.target.value)}
        className="input-field w-full"
        dir="rtl"
      >
        <option value="pending">{t('pending')}</option>
        <option value="processing">{t('processing')}</option>
        <option value="on-hold">{t('onHold')}</option>
        <option value="completed">{t('completed')}</option>
        <option value="cancelled">{t('cancelled')}</option>
        <option value="refunded">{t('refunded')}</option>
      </select>
    </div>
  );
};

export default OrderDetailsStatus;














