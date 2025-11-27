import { useMemo } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * RealtimeResults Component
 * 
 * Displays real-time calculation results as user types
 * 
 * @param {Object} costs - Object containing all cost values
 * @param {string} desiredMargin - Selected margin percentage
 * @param {Array} customCosts - Array of custom costs
 * @param {Function} formatCurrency - Function to format currency values
 */
const RealtimeResults = ({ costs, desiredMargin, customCosts, formatCurrency }) => {
  const { t } = useLanguage();

  const result = useMemo(() => {
    // Parse all costs
    const supplier = parseFloat(costs.supplierCost) || 0;
    const shipping = parseFloat(costs.shippingCost) || 0;
    const packaging = parseFloat(costs.packagingCost) || 0;
    const platform = parseFloat(costs.platformFees) || 0;
    
    // Calculate custom costs total
    const customTotal = customCosts.reduce((sum, cost) => {
      return sum + (parseFloat(cost.amount) || 0);
    }, 0);

    // Calculate total cost
    const totalCost = supplier + shipping + packaging + platform + customTotal;

    if (totalCost <= 0) {
      return null;
    }

    const margin = parseFloat(desiredMargin) || 0;
    
    if (margin <= 0 || margin >= 100) {
      return null;
    }

    // Calculate selling price using margin formula: Selling Price = Cost / (1 - Margin/100)
    const sellingPrice = totalCost / (1 - margin / 100);
    
    // Calculate profit
    const profit = sellingPrice - totalCost;
    
    // Calculate actual margin percentage (for verification)
    const actualMargin = (profit / sellingPrice) * 100;

    return {
      totalCost,
      desiredMargin: margin,
      sellingPrice,
      profit,
      actualMargin,
    };
  }, [costs, desiredMargin, customCosts]);

  if (!result) {
    return (
      <div className="card bg-gray-50 border-gray-200">
        <div className="text-center py-8">
          <p className="text-gray-500 text-sm text-right">
            {t('enterDataToSeeResults') || 'הזן נתונים כדי לראות תוצאות'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="card bg-gradient-to-l from-primary-50 to-primary-100 border-primary-200">
      <h3 className="text-lg font-semibold text-primary-900 mb-4 text-right">
        {t('realtimeResults') || 'תוצאות בזמן אמת'}
      </h3>
      
      <div className="space-y-3">
        {/* Total Cost */}
        <div className="flex justify-between items-center p-3 bg-white rounded-lg">
          <span className="text-sm text-gray-600 text-right">{t('totalCost') || 'עלות כוללת'}</span>
          <span className="text-lg font-semibold text-gray-900">{formatCurrency(result.totalCost)}</span>
        </div>

        {/* Recommended Selling Price */}
        <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-primary-300">
          <span className="text-base font-semibold text-primary-900 text-right">
            {t('recommendedSellingPrice') || 'מחיר מכירה מומלץ'}
          </span>
          <span className="text-3xl font-bold text-primary-600">
            {formatCurrency(result.sellingPrice)}
          </span>
        </div>
        
        {/* Margin and Profit */}
        <div className="grid grid-cols-2 gap-3">
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600 text-right">{t('desiredMargin') || 'שולי רווח רצוי'}</span>
            <span className="text-lg font-semibold text-gray-900">{result.desiredMargin.toFixed(1)}%</span>
          </div>
          <div className="flex justify-between items-center p-3 bg-white rounded-lg">
            <span className="text-sm text-gray-600 text-right">{t('profit') || 'רווח'}</span>
            <span className="text-lg font-semibold text-green-600">{formatCurrency(result.profit)}</span>
          </div>
        </div>

        {/* Profit per unit */}
        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-800 text-right">
              {t('profitPerUnit') || 'רווח ליחידה'}
            </span>
            <span className="text-xl font-bold text-green-700">
              {formatCurrency(result.profit)}
            </span>
          </div>
          <p className="text-xs text-green-700 mt-1 text-right">
            {t('actualMargin') || 'שולי רווח בפועל'}: {result.actualMargin.toFixed(2)}%
          </p>
        </div>
      </div>
    </div>
  );
};

export default RealtimeResults;

