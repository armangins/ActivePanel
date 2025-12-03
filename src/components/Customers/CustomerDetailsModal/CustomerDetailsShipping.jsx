/**
 * CustomerDetailsShipping Component
 * 
 * Displays customer shipping address information.
 * 
 * @param {Object} shipping - Shipping information object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomerDetailsShipping = ({ shipping, isRTL, t }) => {
  if (!shipping) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
        {t('shippingAddress') || 'Shipping Address'}
      </h3>
      <div className={`text-sm text-gray-600 space-y-1 ${'text-right'}`}>
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
      </div>
    </div>
  );
};

export default CustomerDetailsShipping;







