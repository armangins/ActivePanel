import { useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { DocumentDuplicateIcon as Copy, CheckIcon as Check, PlusIcon as Plus } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * DetailedResults Component
 * 
 * Displays detailed calculation results with full cost breakdown
 * 
 * @param {Object} costs - Object containing all cost values
 * @param {string} desiredMargin - Selected margin percentage
 * @param {Array} customCosts - Array of custom costs
 * @param {Function} formatCurrency - Function to format currency values
 */
const DetailedResults = ({ costs, desiredMargin, customCosts, formatCurrency }) => {
  const { t } = useLanguage();
  const navigate = useNavigate();
  const [copied, setCopied] = useState(false);

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
    
    // Calculate actual margin percentage
    const actualMargin = (profit / sellingPrice) * 100;

    return {
      supplierCost: supplier,
      shippingCost: shipping,
      packagingCost: packaging,
      platformFees: platform,
      customCosts: customCosts.filter(c => c.name && c.amount),
      customCostsTotal: customTotal,
      totalCost,
      desiredMargin: margin,
      sellingPrice,
      profit,
      actualMargin,
    };
  }, [costs, desiredMargin, customCosts]);

  const handleCopyPrice = async () => {
    if (!result) return;
    const priceText = result.sellingPrice.toFixed(2);
    try {
      await navigator.clipboard.writeText(priceText);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch (err) {
      // Fallback for older browsers
      const textArea = document.createElement('textarea');
      textArea.value = priceText;
      document.body.appendChild(textArea);
      textArea.select();
      document.execCommand('copy');
      document.body.removeChild(textArea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  if (!result) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6 flex-1 flex items-center justify-center min-h-0">
        <div className="text-center">
          <p className="text-gray-500 text-sm">
            {t('enterDataToSeeResults') || 'הזן נתונים כדי לראות תוצאות מפורטות'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-6 flex flex-col flex-1 min-h-0 overflow-hidden">
      <h3 className="text-lg font-bold text-gray-900 mb-4 text-right">
        {t('detailedResults') || 'תוצאות מפורטות'}
      </h3>
      
      <div className="space-y-6 flex-1 overflow-y-auto">
        {/* Cost Breakdown */}
        <div>
          <h4 className="text-sm font-semibold text-gray-700 mb-2 text-right">
            {t('costBreakdown') || 'פירוט עלויות'}
          </h4>
          <div className="space-y-2 bg-gray-50 rounded-lg p-4">
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
            <div className="border-t border-gray-300 pt-3 mt-3">
              <div className="flex justify-between items-center">
                <span className="text-sm font-bold text-gray-900 text-right">{t('totalCost') || 'עלות כוללת'}</span>
                <span className="text-base font-bold text-gray-900">{formatCurrency(result.totalCost)}</span>
              </div>
            </div>
          </div>
        </div>

        {/* Recommended Selling Price */}
        <div className="bg-gradient-to-l from-primary-50 to-primary-100 border-2 border-primary-300 rounded-lg p-6">
          <div className="flex items-center justify-between mb-2 flex-row-reverse">
            <span className="text-sm font-bold text-primary-900 text-right">
              {t('recommendedSellingPrice') || 'מחיר מכירה מומלץ'}
            </span>
            <button
              type="button"
              onClick={handleCopyPrice}
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-white rounded-lg transition-colors"
              title={t('copy') || 'העתק'}
            >
              {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5" />}
            </button>
          </div>
          <div className="text-right">
            <span className="text-3xl font-bold text-primary-600">
              {formatCurrency(result.sellingPrice)}
            </span>
          </div>
        </div>
        
        {/* Profit and Margin Details */}
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">{t('desiredMargin') || 'שולי רווח רצוי'}</p>
              <p className="text-lg font-bold text-gray-900">{result.desiredMargin.toFixed(1)}%</p>
            </div>
          </div>
          <div className="bg-white border border-gray-200 rounded-lg p-4">
            <div className="text-right">
              <p className="text-xs text-gray-600 mb-1">{t('profit') || 'רווח'}</p>
              <p className="text-lg font-bold text-green-600">{formatCurrency(result.profit)}</p>
            </div>
          </div>
        </div>

        {/* Create Product Button */}
        <button
          type="button"
          onClick={() => {
            navigate(`/products/add?price=${result.sellingPrice.toFixed(2)}`);
          }}
          className="w-full btn-primary flex items-center justify-center gap-2 flex-row"
        >
          <Plus className="w-5 h-5" />
          <span>{t('createProductWithThisPrice') || 'צור מוצר עם מחיר זה'}</span>
        </button>
      </div>
    </div>
  );
};

export default DetailedResults;

