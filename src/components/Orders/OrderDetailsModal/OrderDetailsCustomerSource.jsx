/**
 * OrderDetailsCustomerSource Component
 * 
 * Displays customer source information including source, referral, and IP address.
 * Extracts source information from order meta_data.
 * 
 * @param {Object} order - Order object
 * @param {Boolean} isRTL - Whether the layout is right-to-left
 * @param {Function} t - Translation function
 */
const OrderDetailsCustomerSource = ({ order, isRTL, t }) => {
  // Extract customer source information from order
  const getCustomerSource = () => {
    // Check meta_data for source information
    const metaData = order.meta_data || [];
    const sourceMeta = metaData.find(meta => 
      meta.key === '_order_source' || 
      meta.key === '_utm_source' || 
      meta.key === '_wc_order_attribution_source' ||
      meta.key === '_order_attribution_source'
    );
    
    // Look for referral information
    const referralMeta = metaData.find(meta => 
      meta.key === '_order_referrer' || 
      meta.key === '_http_referer' ||
      meta.key === '_http_referrer' ||
      meta.key === '_wc_order_attribution_referrer' ||
      meta.key === '_referrer'
    );
    
    const referral = referralMeta?.value || 
                    order.referrer || 
                    order.http_referer ||
                    null;
    
    const ipAddress = order.customer_ip_address || 
                     metaData.find(meta => meta.key === '_customer_ip_address')?.value ||
                     null;

    return {
      source: sourceMeta?.value || null,
      referral: referral,
      ipAddress: ipAddress,
    };
  };

  const customerSource = getCustomerSource();

  // Don't render if no source information available
  if (!customerSource.source && !customerSource.referral && !customerSource.ipAddress) {
    return null;
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-4">
      <h3 className={`text-sm font-medium text-gray-700 mb-3 ${'text-right'}`}>
        {t('customerSource') || 'Customer Source'}
      </h3>
      <div className="space-y-4 text-sm">
        {customerSource.source && (
          <div>
            <div className={`text-gray-600 mb-1 ${'text-right'}`}>
              {t('source') || 'Source'}:
            </div>
            <div className={`text-gray-900 font-medium ${'text-right'}`}>
              {customerSource.source}
            </div>
          </div>
        )}
        {customerSource.referral && (
          <div>
            <div className={`text-gray-600 mb-1 ${'text-right'}`}>
              {t('referral') || 'Referral'}:
            </div>
            <div className={`text-gray-900 font-medium text-xs break-all ${'text-right'}`}>
              {customerSource.referral}
            </div>
          </div>
        )}
        {customerSource.ipAddress && (
          <div>
            <div className={`text-gray-600 mb-1 ${'text-right'}`}>
              {t('ipAddress') || 'IP Address'}:
            </div>
            <div className={`text-gray-900 font-medium ${'text-right'}`}>
              {customerSource.ipAddress}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default OrderDetailsCustomerSource;







