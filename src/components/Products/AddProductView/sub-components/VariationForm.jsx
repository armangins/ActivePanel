import { memo } from 'react';
import { XMarkIcon as X, ArrowPathIcon as Loader, SparklesIcon as Sparkles } from '@heroicons/react/24/outline';
import { Input } from '../../../ui/inputs';
import { Button } from '../../../ui';
import { ImageUpload } from './';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * VariationForm Component
 * 
 * Shared form component for creating and editing variations.
 * Contains all the form fields: attributes, prices, SKU, stock, and image.
 * 
 * @param {Object} formData - Variation form data
 * @param {function} onFormDataChange - Callback when form data changes
 * @param {Array} selectedAttributeIds - IDs of selected attributes
 * @param {Array} attributes - All available attributes
 * @param {Object} attributeTerms - Terms for each attribute
 * @param {boolean} generatingSKU - Whether SKU is being generated
 * @param {function} onGenerateSKU - Callback to generate SKU
 * @param {string} parentProductName - Parent product name (for SKU generation)
 * @param {boolean} disabled - Whether form is disabled
 */
const VariationForm = ({
  formData,
  onFormDataChange,
  selectedAttributeIds = [],
  attributes = [],
  attributeTerms = {},
  generatingSKU = false,
  onGenerateSKU,
  parentProductName = '',
  disabled = false,
}) => {
  const { t } = useLanguage();

  const handleAttributeChange = (attributeId, termId) => {
    onFormDataChange({
      ...formData,
      attributes: {
        ...formData.attributes,
        [attributeId]: termId ? parseInt(termId) : null
      }
    });
  };

  const handleFieldChange = (field, value) => {
    onFormDataChange({
      ...formData,
      [field]: value
    });
  };

  return (
    <div className="space-y-6">
      {/* Attributes Selection */}
      {selectedAttributeIds.length > 0 ? (
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-3 text-right">
            {t('selectVariationAttributes') || 'בחר תכונות לוריאציה'} <span className="text-orange-500">*</span>
          </label>
          <div className="space-y-4">
            {selectedAttributeIds.map(attributeId => {
              const attribute = attributes.find(attr => attr.id === attributeId);
              const terms = attributeTerms[attributeId];

              if (!attribute || !terms || terms.length === 0) return null;

              return (
                <div key={attributeId}>
                  <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                    {attribute.name}
                  </label>
                  <select
                    value={formData.attributes?.[attributeId] || ''}
                    onChange={(e) => handleAttributeChange(attributeId, e.target.value)}
                    className="input-field text-right w-full"
                    dir="rtl"
                    disabled={disabled}
                  >
                    <option value="">{t('select') || 'בחר...'}</option>
                    {terms.map(term => (
                      <option key={term.id} value={term.id}>{term.name}</option>
                    ))}
                  </select>
                </div>
              );
            })}
          </div>
        </div>
      ) : (
        <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
          <p className="text-sm text-yellow-800 text-right">
            {t('selectAttributesFirst') || 'אנא בחר תכונות למוצר תחילה'}
          </p>
        </div>
      )}

      {/* Price Fields */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <Input
            label={t('regularPrice')}
            type="number"
            value={formData.regular_price || ''}
            onChange={(e) => handleFieldChange('regular_price', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            prefix="₪"
            required
            disabled={disabled}
          />
        </div>
        <div>
          <Input
            label={t('salePrice')}
            type="number"
            value={formData.sale_price || ''}
            onChange={(e) => handleFieldChange('sale_price', e.target.value)}
            placeholder="0.00"
            step="0.01"
            min="0"
            prefix="₪"
            disabled={disabled}
          />
        </div>
      </div>

      {/* SKU and Stock */}
      <div className="grid grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
            {t('sku')}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.sku || ''}
              onChange={(e) => handleFieldChange('sku', e.target.value)}
              placeholder={t('enterSKU') || 'הכנס SKU'}
              containerClassName="flex-1"
              disabled={disabled}
            />
            <Button
              type="button"
              variant="secondary"
              size="icon"
              onClick={() => onGenerateSKU?.()}
              disabled={disabled || generatingSKU}
              className="px-3 w-auto"
              title={t('createWithAI') || 'צור בעזרת AI'}
            >
              {generatingSKU ? <Loader className="w-[18px] h-[18px] animate-spin" /> : <Sparkles className="w-[18px] h-[18px]" />}
            </Button>
          </div>
        </div>
        <div>
          <Input
            label={t('stockQuantity')}
            type="number"
            value={formData.stock_quantity || ''}
            onChange={(e) => handleFieldChange('stock_quantity', e.target.value)}
            placeholder="0"
            min="0"
            disabled={disabled}
          />
        </div>
      </div>

      {/* Image Upload */}
      <ImageUpload
        label={t('variationImage') || 'תמונת וריאציה'}
        value={formData.image}
        onChange={(image) => handleFieldChange('image', image)}
        disabled={disabled}
      />
    </div>
  );
};

export default memo(VariationForm);





