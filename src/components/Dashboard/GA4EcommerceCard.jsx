import { ShoppingCart, DollarSign, TrendingUp, Users } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * GA4EcommerceCard Component
 * 
 * Displays e-commerce events from Google Analytics 4 (purchases, add to cart, revenue).
 * 
 * @param {Object} purchaseData - GA4 purchase events data
 * @param {Object} addToCartData - GA4 add to cart events data
 * @param {Object} revenueData - GA4 revenue data
 * @param {Function} formatCurrency - Function to format currency values
 * @param {Function} t - Translation function
 * @param {boolean} isRTL - Whether the layout is right-to-left
 */
const GA4EcommerceCard = ({ purchaseData, addToCartData, revenueData, formatCurrency, t, isRTL }) => {
  const getMetricValue = (data, index) => {
    if (!data || !data.rows || data.rows.length === 0) return '0';
    return data.rows[0]?.metricValues?.[index]?.value || '0';
  };

  const purchases = getMetricValue(purchaseData, 0);
  const purchaseUsers = getMetricValue(purchaseData, 1);
  const addToCart = getMetricValue(addToCartData, 0);
  const revenue = getMetricValue(revenueData, 0);

  const hasData = purchaseData || addToCartData || revenueData;

  if (!hasData) {
    return (
      <div className="card">
        <div className={`text-center py-8 ${'text-right'}`}>
          <p className="text-gray-500">{t('noGA4Data') || 'No GA4 data available'}</p>
          <p className="text-xs text-gray-400 mt-2">
            {t('configureGA4') || 'Configure GA4 in Settings'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card">
      <h3 className={`text-lg font-semibold text-gray-900 mb-4 ${'text-right'}`}>
        {t('ga4Ecommerce') || 'GA4 E-commerce'}
      </h3>
      <div className="space-y-4">
        {revenueData && (
          <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
            <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
              <DollarSign size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">{t('revenue') || 'Revenue'}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">
              {formatCurrency ? formatCurrency(parseFloat(revenue)) : `$${parseFloat(revenue).toFixed(2)}`}
            </span>
          </div>
        )}
        {purchaseData && (
          <>
            <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
              <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                <ShoppingCart size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">{t('purchases') || 'Purchases'}</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{parseInt(purchases).toLocaleString()}</span>
            </div>
            <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
              <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
                <Users size={18} className="text-gray-400" />
                <span className="text-sm text-gray-600">{t('purchaseUsers') || 'Purchase Users'}</span>
              </div>
              <span className="text-lg font-semibold text-gray-900">{parseInt(purchaseUsers).toLocaleString()}</span>
            </div>
          </>
        )}
        {addToCartData && (
          <div className={`flex items-center justify-between ${'flex-row-reverse'}`}>
            <div className={`flex items-center gap-2 ${'flex-row-reverse'}`}>
              <TrendingUp size={18} className="text-gray-400" />
              <span className="text-sm text-gray-600">{t('addToCart') || 'Add to Cart'}</span>
            </div>
            <span className="text-lg font-semibold text-gray-900">{parseInt(addToCart).toLocaleString()}</span>
          </div>
        )}
      </div>
    </div>
  );
};

export default GA4EcommerceCard;

