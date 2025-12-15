import { useMemo, useEffect, useState } from 'react';
import { CheckCircleOutlined as CheckCircleIcon, CopyOutlined as Copy, CheckOutlined as Check } from '@ant-design/icons';
import { Button } from '../ui';
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
 * @param {Function} onResultChange - Optional callback when result changes
 * @param {Function} onUsePrice - Optional callback when "use this price" is clicked
 */
const RealtimeResults = ({ costs, desiredMargin, customCosts, formatCurrency, onResultChange, onUsePrice }) => {
  const { t } = useLanguage();
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

  // Emit event when price is calculated and notify parent
  useEffect(() => {
    if (result && result.sellingPrice) {
      window.dispatchEvent(new CustomEvent('calculatorPriceUpdate', {
        detail: { sellingPrice: result.sellingPrice }
      }));
      if (onResultChange) {
        onResultChange(result);
      }
    } else {
      if (onResultChange) {
        onResultChange(null);
      }
    }
  }, [result, onResultChange]);

  if (!result) {
    return (
      <div className="bg-gray-50 border border-gray-200 rounded-lg p-6">
        <div className="text-right py-4">
          <p className="text-gray-500 text-sm text-right">
            {t('enterDataToSeeResults') || 'הזן נתונים כדי לראות תוצאות'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-l from-primary-50 to-primary-100 border border-primary-200 rounded-lg p-6">
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
          <div className="flex items-center gap-2 flex-row-reverse">
            <span className="text-3xl font-bold text-primary-600">
              {formatCurrency(result.sellingPrice)}
            </span>
            <Button
              type="button"
              onClick={async () => {
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
              }}
              variant="ghost"
              size="icon"
              className="p-2 text-gray-500 hover:text-primary-600 hover:bg-primary-50 rounded-lg transition-colors"
              title={t('copy') || 'העתק'}
            >
              {copied ? <Check className="w-[18px] h-[18px] text-green-600" /> : <Copy className="w-[18px] h-[18px]" />}
            </Button>
          </div>
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
      </div>
    </div>
  );
};

export default RealtimeResults;

