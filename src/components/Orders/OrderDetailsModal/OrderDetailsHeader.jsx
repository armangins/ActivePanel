import { X } from 'lucide-react';

/**
 * OrderDetailsHeader Component
 * 
 * Header section of the order details modal with order ID and close button.
 * 
 * @param {Object} order - Order object
 * @param {Function} onClose - Callback to close the modal
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsHeader = ({ order, onClose, isRTL, t }) => {
  return (
    <div className={`p-6 border-b border-gray-200 flex items-center justify-between bg-white`}>
      <h2 className={`text-2xl font-bold text-gray-900 ${'text-right'}`}>
        {t('orderDetails')} #{order.id}
      </h2>
      <button
        onClick={onClose}
        className="text-gray-400 hover:text-gray-600 transition-colors"
        aria-label={t('close') || 'Close'}
      >
        <X size={24} />
      </button>
    </div>
  );
};

export default OrderDetailsHeader;


