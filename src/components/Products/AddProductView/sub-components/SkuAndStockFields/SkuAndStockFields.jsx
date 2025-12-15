import { Input } from '../../../../ui/inputs';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * SkuAndStockFields Component
 * 
 * Handles stock quantity and stock status management.
 */
const SkuAndStockFields = ({
  formData,
  errors,
  onStockChange,
  onManageStockChange,
  onStockStatusChange
}) => {
  const { t } = useLanguage();

  return (
    <div className="space-y-4">
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
  );
};

export default SkuAndStockFields;
