import { SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { Input } from '../../../ui/inputs';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * SkuAndStockFields Component
 * 
 * Handles SKU input (with AI generation) and stock quantity.
 */
const SkuAndStockFields = ({ 
  formData, 
  errors, 
  onSkuChange, 
  onStockChange, 
  onGenerateSKU, 
  generatingSKU 
}) => {
  const { t } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* SKU */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          {t('sku')}
        </label>
        <div className="relative">
          <input
            type="text"
            value={formData.sku}
            onChange={(e) => onSkuChange(e.target.value)}
            placeholder={t('enterSKU') || 'Enter SKU'}
            className="input-field text-right"
            dir="rtl"
          />
          <button
            type="button"
            onClick={onGenerateSKU}
            disabled={generatingSKU}
            className={`absolute left-2 top-1/2 -translate-y-1/2 p-1.5 rounded-lg transition-colors ${
              generatingSKU 
                ? 'text-gray-400 cursor-not-allowed' 
                : 'text-primary-600 hover:bg-primary-50 hover:text-primary-700'
            }`}
            title={t('createWithAI') || 'צור בעזרת AI'}
          >
            {generatingSKU ? (
              <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-primary-600"></div>
            ) : (
              <Sparkles className="w-4 h-4" />
            )}
          </button>
        </div>
      </div>

      {/* Stock Quantity */}
      <div>
        <Input
          label={t('stockQuantity')}
          type="number"
          value={formData.stock_quantity}
          onChange={(e) => onStockChange(e.target.value)}
          placeholder="0"
          error={errors.stock_quantity}
          min="0"
          required
        />
      </div>
    </div>
  );
};

export default SkuAndStockFields;

