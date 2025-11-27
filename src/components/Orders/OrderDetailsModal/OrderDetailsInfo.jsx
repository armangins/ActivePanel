import OrderDetailsBilling from './OrderDetailsBilling';
import OrderDetailsShipping from './OrderDetailsShipping';

/**
 * OrderDetailsInfo Component
 * 
 * Container component that displays billing and shipping information in a two-column layout.
 * 
 * @param {Object} order - Order object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsInfo = ({ order, isRTL, t }) => {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {/* Billing Information */}
      <OrderDetailsBilling
        billing={order.billing}
        isRTL={isRTL}
        t={t}
      />

      {/* Shipping Information */}
      <OrderDetailsShipping
        shipping={order.shipping}
        shippingLines={order.shipping_lines}
        isRTL={isRTL}
        t={t}
      />
    </div>
  );
};

export default OrderDetailsInfo;

