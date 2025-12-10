import { SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { Input } from '../../../../ui/inputs';
import { Button } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';

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
  onManageStockChange,
  onStockStatusChange,
  onGenerateSKU,
  generatingSKU
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* SKU */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {t('sku')}
          </label>
          <div className="relative">
            <input
              type="text"
              value={formData.sku || ''}
              onChange={(e) => onSkuChange(e.target.value)}
              placeholder={t('enterSKU') || 'Enter SKU'}
              className="input-field text-right w-full pr-10"
              dir="rtl"
              data-testid="sku-input"
            />
            <div className="absolute left-2 top-1/2 -translate-y-1/2">
              <Button
                variant="ghost"
                size="icon"
                onClick={onGenerateSKU}
                disabled={generatingSKU}
                className={`p-1.5 h-auto ${generatingSKU
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
              </Button>
            </div>
          </div>
        </div>

        {/* Stock Management */}
        <div>
          <div className="flex items-center justify-between mb-2">
            <label className="block text-sm font-medium text-gray-700 text-right">
              {formData.manage_stock ? (t('stockQuantity') || 'כמות במלאי') : (t('stockStatus') || 'סטטוס מלאי')}
              {formData.manage_stock && <span className="text-orange-500 mr-1">*</span>}
            </label>
            <label className="flex items-center gap-2 cursor-pointer">
              <span className="text-xs text-gray-500">{t('manageStock') || 'ניהול מלאי'}</span>
              <input
                type="checkbox"
                checked={formData.manage_stock ?? true}
                onChange={(e) => onManageStockChange(e.target.checked)}
                className="rounded border-gray-300 text-primary-600 focus:ring-primary-500 w-4 h-4"
              />
            </label>
          </div>

          {formData.manage_stock ? (
            <Input
              type="number"
              value={formData.stock_quantity || ''}
              onChange={(e) => onStockChange(e.target.value)}
              placeholder="0"
              error={errors.stock_quantity?.message}
              min="0"
              step="1"
              required
              className="w-full text-right"
              dir="rtl"
              testId="stock-quantity-input"
            />
          ) : (
            <select
              value={formData.stock_status || 'instock'}
              onChange={(e) => onStockStatusChange(e.target.value)}
              className="input-field w-full text-right"
              dir="rtl"
            >
              <option value="instock">{t('inStock') || 'במלאי'}</option>
              <option value="outofstock">{t('outOfStock') || 'אזל מהמלאי'}</option>
              <option value="onbackorder">{t('onBackorder') || 'הזמנה מראש'}</option>
            </select>
          )}
        </div>
      </div>
    </div>
  );
};

export default SkuAndStockFields;

