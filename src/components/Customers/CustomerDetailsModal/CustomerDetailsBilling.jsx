/**
 * CustomerDetailsBilling Component
 * 
 * Displays customer billing address information.
 * 
 * @param {Object} billing - Billing information object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const CustomerDetailsBilling = ({ billing, isRTL, t }) => {
  if (!billing) return null;

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
        {t('billingAddress') || 'Billing Address'}
      </h3>
      <div className={`text-sm text-gray-600 space-y-1 ${'text-right'}`}>
        <p>{billing.first_name} {billing.last_name}</p>
        {billing.company && <p>{billing.company}</p>}
        {billing.address_1 && <p>{billing.address_1}</p>}
        {billing.address_2 && <p>{billing.address_2}</p>}
        {billing.city && (
          <p>
            {billing.city}
            {billing.state && `, ${billing.state}`}
            {billing.postcode && ` ${billing.postcode}`}
          </p>
        )}
        {billing.country && <p>{billing.country}</p>}
        {billing.phone && (
          <p className="mt-2">
            {t('phone') || 'טלפון'}: {billing.phone}
          </p>
        )}
      </div>
    </div>
  );
};

export default CustomerDetailsBilling;


