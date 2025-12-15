import { memo } from 'react';
import { ReloadOutlined as Loader, ThunderboltOutlined as Sparkles } from '@ant-design/icons';
import { Input } from '../../../../ui/inputs';
import { Button } from '../../../../ui';
import { ImageUpload } from '../';
import { useLanguage } from '../../../../../contexts/LanguageContext';

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
 * @param {string} parentSku - Parent product SKU
 * @param {Array} existingVariationSkus - Array of SKUs from other variations (excluding current)
 * @param {string|number} currentVariationId - ID of current variation (for edit mode, to exclude from duplicate check)
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
  parentSku = '',
  existingVariationSkus = [],
  currentVariationId = null,
  disabled = false,
}) => {
  const { t } = useLanguage();

  // Validate SKU for duplicates
  const getSkuValidationError = () => {
    const currentSku = (formData.sku || '').trim();
    if (!currentSku) return null; // Empty SKU is allowed

    // Check against parent SKU
    if (parentSku && currentSku === parentSku.trim()) {
      return t('skuCannotMatchParent') || 'המק״ט לא יכול להיות זהה למק״ט האב';
    }

    // Check against other variations
    // existingVariationSkus should already exclude the current variation in edit mode
    const hasDuplicate = existingVariationSkus.some(sku => {
      return sku && sku.trim() === currentSku;
    });

    if (hasDuplicate) {
      return t('skuAlreadyUsedByVariation') || 'מק״ט זה כבר בשימוש על ידי וריאציה אחרת';
    }

    return null;
  };

  const skuError = getSkuValidationError();

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
          <div className="grid grid-cols-2 gap-4">
            {selectedAttributeIds
              .filter(attrId => {
                const attribute = attributes.find(attr => attr.id === attrId);
                const terms = attributeTerms[attrId];
                return attribute && terms && terms.length > 0;
              })
              .map((attributeId, index, array) => {
                const attribute = attributes.find(attr => attr.id === attributeId);
                const terms = attributeTerms[attributeId]; // We know it exists from filter

                const isColor = ['color', 'colour', 'צבע', 'colors', 'colours'].some(k => attribute.name.toLowerCase().includes(k));
                const isSingle = array.length === 1;

                return (
                  <div key={attributeId} className={isColor || isSingle ? 'col-span-2' : ''}>
                    <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
                      {attribute.name}
                    </label>

                    {isColor ? (
                      <div className="flex flex-wrap gap-2">
                        {terms.map(term => {
                          const isSelected = formData.attributes?.[attributeId] === term.id;
                          const colorValue = term.slug;

                          return (
                            <button
                              key={term.id}
                              type="button"
                              onClick={() => handleAttributeChange(attributeId, term.id)}
                              title={term.name}
                              className={`
                                w-10 h-10 rounded-full border-2 transition-all relative flex items-center justify-center
                                ${isSelected
                                  ? 'border-primary-500 ring-2 ring-primary-200 scale-110'
                                  : 'border-gray-200 hover:border-gray-300'
                                }
                              `}
                              style={{ backgroundColor: colorValue }}
                              disabled={disabled}
                            >
                              {isSelected && (
                                <span className="bg-white rounded-full p-0.5 shadow-sm">
                                  <span className="block w-2.5 h-2.5 bg-primary-600 rounded-full" />
                                </span>
                              )}
                            </button>
                          );
                        })}
                      </div>
                    ) : (
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
                    )}
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
            label={t('regularPrice') || 'מחיר רגיל'}
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
            label={t('salePrice') || 'מחיר מבצע'}
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
            {t('sku') || 'מק״ט'}
          </label>
          <div className="flex gap-2">
            <Input
              type="text"
              value={formData.sku || ''}
              onChange={(e) => handleFieldChange('sku', e.target.value)}
              placeholder={t('enterSKU') || 'הכנס SKU'}
              containerClassName="flex-1"
              size="lg"
              disabled={disabled}
              className={skuError ? 'border-red-500 focus:border-red-500 focus:ring-red-500' : ''}
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
          {skuError && (
            <p className="text-xs text-red-500 mt-1 text-right">
              {skuError}
            </p>
          )}
        </div>
        <div>
          <Input
            label={t('stockQuantity') || 'כמות במלאי'}
            size="lg"
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
    </div >
  );
};

export default memo(VariationForm);





