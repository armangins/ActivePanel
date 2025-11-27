/**
 * OrderDetailsShipping Component
 * 
 * Displays shipping information for an order, including shipping method.
 * 
 * @param {Object} shipping - Shipping information object
 * @param {Array} shippingLines - Array of shipping line items (for shipping method)
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsShipping = ({ shipping, shippingLines, isRTL, t }) => {
  if (!shipping && (!shippingLines || shippingLines.length === 0)) return null;

  // Get shipping method from shipping_lines
  const shippingMethod = shippingLines && shippingLines.length > 0
    ? shippingLines[0].method_title || shippingLines[0].method_id
    : null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
        {t('shippingInfo')}
      </h3>
      <div className={`text-sm text-gray-600 space-y-1 ${'text-right'}`}>
        {/* Shipping Method */}
        {shippingMethod && (
          <div className="mb-2 pb-2 border-b border-gray-200">
            <span className="font-medium text-gray-700">{t('shippingMethod') || 'Shipping Method'}: </span>
            <span className="text-gray-900">{shippingMethod}</span>
          </div>
        )}
        
        {/* Shipping Address */}
        {shipping && (
          <>
            <p>{shipping.first_name} {shipping.last_name}</p>
            {shipping.company && <p>{shipping.company}</p>}
            {shipping.address_1 && <p>{shipping.address_1}</p>}
            {shipping.address_2 && <p>{shipping.address_2}</p>}
            {shipping.city && (
              <p>
                {shipping.city}
                {shipping.state && `, ${shipping.state}`}
                {shipping.postcode && ` ${shipping.postcode}`}
              </p>
            )}
            {shipping.country && <p>{shipping.country}</p>}
          </>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsShipping;

