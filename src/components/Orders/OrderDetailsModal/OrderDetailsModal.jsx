import { useState, useEffect } from 'react';
import { ordersAPI } from '../../../services/woocommerce';
import OrderDetailsHeader from './OrderDetailsHeader';
import OrderDetailsInfo from './OrderDetailsInfo';
import OrderDetailsCustomerSource from './OrderDetailsCustomerSource';
import OrderDetailsItems from './OrderDetailsItems';
import OrderDetailsStatus from './OrderDetailsStatus';
import OrderDetailsFooter from './OrderDetailsFooter';
import OrderDetailsLoading from './OrderDetailsLoading';

/**
 * OrderDetailsModal Component
 * 
 * Main modal component for displaying order details.
 * Loads full order details including meta_data when opened.
 * 
 * @param {Object} order - Order object to display (may be partial from list)
 * @param {Function} onClose - Callback to close the modal
 * @param {Function} onStatusUpdate - Callback when order status is updated
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsModal = ({ order, onClose, onStatusUpdate, formatCurrency, isRTL, t }) => {
  const [fullOrder, setFullOrder] = useState(order);
  const [loading, setLoading] = useState(false);

  // Load full order details when modal opens
  useEffect(() => {
    const loadFullOrder = async () => {
      if (!order?.id) return;
      
      try {
        setLoading(true);
        const fullOrderData = await ordersAPI.getById(order.id);
        setFullOrder(fullOrderData);
      } catch (error) {
        // Failed to load full order details
        // Fall back to the order passed as prop
      } finally {
        setLoading(false);
      }
    };

    loadFullOrder();
  }, [order?.id]);

  if (!order) return null;

  // Use fullOrder if available, otherwise fall back to order prop
  const displayOrder = fullOrder || order;

  return (
    <div 
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4"
      onClick={onClose}
    >
      <div 
        className="bg-gray-50 rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-lg"
        onClick={(e) => e.stopPropagation()}
        dir="rtl"
      >
        {/* Header */}
        <OrderDetailsHeader
          order={displayOrder}
          onClose={onClose}
          isRTL={isRTL}
          t={t}
        />

        {/* Content */}
        <div className="p-6 space-y-6 bg-gray-50">
          {loading ? (
            <OrderDetailsLoading />
          ) : (
            <>
              {/* Order Info - Billing and Shipping */}
              <OrderDetailsInfo
                order={displayOrder}
                isRTL={isRTL}
                t={t}
              />

              {/* Customer Source Information */}
              <OrderDetailsCustomerSource
                order={displayOrder}
                isRTL={isRTL}
                t={t}
              />

              {/* Order Items */}
              <OrderDetailsItems
                order={displayOrder}
                formatCurrency={formatCurrency}
                isRTL={isRTL}
                t={t}
              />

              {/* Order Status */}
              <OrderDetailsStatus
                order={displayOrder}
                onStatusUpdate={onStatusUpdate}
                isRTL={isRTL}
                t={t}
              />
            </>
          )}
        </div>

        {/* Footer */}
        <OrderDetailsFooter
          onClose={onClose}
          isRTL={isRTL}
          t={t}
        />
      </div>
    </div>
  );
};

export default OrderDetailsModal;

