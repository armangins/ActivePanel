import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CalculationResults Component
 * 
 * Displays the calculation results including cost breakdown and pricing
 * 
 * @param {Object} result - Calculation result object
 * @param {Function} formatCurrency - Function to format currency values
 */
const CalculationResults = ({ result, formatCurrency }) => {
  const { t } = useLanguage();

  if (!result) return null;

  return (
    <div className="mt-6 p-6 bg-gradient-to-l from-primary-50 to-primary-100 rounded-lg border border-primary-200">
      <h3 className="text-lg font-semibold text-primary-900 mb-4 text-right">
        {t('calculationResult') || 'תוצאות החישוב'}
      </h3>
      
      {/* Cost Breakdown */}
      <div className="mb-4">
        <h4 className="text-sm font-semibold text-gray-700 mb-2 text-right">
          {t('costBreakdown') || 'פירוט עלויות'}
        </h4>
        <div className="space-y-2 bg-white rounded-lg p-3">
          <div className="flex justify-between items-center">
            <span className="text-sm text-gray-600 text-right">{t('supplierCost') || 'עלות ספק'}</span>
            <span className="text-sm font-medium text-gray-900">{formatCurrency(result.supplierCost)}</span>
          </div>
          {result.shippingCost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 text-right">{t('shippingCost') || 'עלות משלוח'}</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(result.shippingCost)}</span>
            </div>
          )}
          {result.packagingCost > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 text-right">{t('packagingCost') || 'עלות אריזה'}</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(result.packagingCost)}</span>
            </div>
          )}
          {result.platformFees > 0 && (
            <div className="flex justify-between items-center">
              <span className="text-sm text-gray-600 text-right">{t('platformOrTransactionFees') || 'עמלות פלטפורמה'}</span>
              <span className="text-sm font-medium text-gray-900">{formatCurrency(result.platformFees)}</span>
            </div>
          )}
          {result.customCosts.map((cost, index) => (
            cost.name && cost.amount && (
              <div key={index} className="flex justify-between items-center">
                <span className="text-sm text-gray-600 text-right">{cost.name}</span>
                <span className="text-sm font-medium text-gray-900">{formatCurrency(parseFloat(cost.amount))}</span>
              </div>
            )
          ))}
          <div className="border-t border-gray-200 pt-2 mt-2">
            <div className="flex justify-between items-center">
              <span className="text-sm font-semibold text-gray-700 text-right">{t('totalCost') || 'עלות כוללת'}</span>
              <span className="text-base font-bold text-gray-900">{formatCurrency(result.totalCost)}</span>
            </div>
          </div>
        </div>
      </div>

      {/* Pricing Results */}
      <div className="space-y-3">
        <div className="flex justify-between items-center p-4 bg-white rounded-lg border-2 border-primary-300">
          <span className="text-base font-semibold text-primary-900 text-right">
            {t('recommendedSellingPrice') || 'מחיר מכירה מומלץ'}
          </span>
          <span className="text-3xl font-bold text-primary-600">
            {formatCurrency(result.sellingPrice)}
          </span>
        </div>
        
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

        <div className="p-3 bg-green-50 border border-green-200 rounded-lg">
          <div className="flex justify-between items-center">
            <span className="text-sm font-medium text-green-800 text-right">
              {t('profitPerUnit') || 'רווח ליחידה'}
            </span>
            <span className="text-xl font-bold text-green-700">
              {formatCurrency(result.profitPerUnit)}
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

export default CalculationResults;

