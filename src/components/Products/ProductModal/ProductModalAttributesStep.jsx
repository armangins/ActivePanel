import { PlusIcon as Plus, TrashIcon, XMarkIcon as X } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * ProductModalAttributesStep Component
 * 
 * Third step of the product modal - attributes and variations
 */
const ProductModalAttributesStep = ({
  formData,
  allAttributes,
  updateAttribute,
  addAttribute,
  removeAttribute,
  addAttributeOption,
  removeAttributeOption,
  loadAttributeTerms,
}) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="space-y-6">
      {/* Attributes Section */}
      <div className="space-y-4">
        <h3 className={`text-lg font-semibold text-gray-800 text-right`}>
          {t('attributes')}
        </h3>
        <div className={`flex items-center flex-row-reverse justify-between`}>
          <button
            type="button"
            onClick={addAttribute}
            className="btn-secondary flex items-center space-x-2"
          >
            <Plus className="w-[18px] h-[18px]" />
            <span>{t('addAttribute')}</span>
          </button>
        </div>

        {formData.attributes.map((attr, index) => (
          <div key={index} className="card">
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
                    {t('attributeName')} *
                  </label>
                  <select
                    value={attr.id || ''}
                    onChange={(e) => {
                      const selectedId = parseInt(e.target.value);
                      const selectedAttr = allAttributes.find(a => a.id === selectedId);
                      if (selectedAttr) {
                        updateAttribute(index, 'id', selectedId);
                        updateAttribute(index, 'name', selectedAttr.name);
                        loadAttributeTerms(selectedId, index);
                      } else {
                        updateAttribute(index, 'id', 0);
                        updateAttribute(index, 'name', '');
                      }
                    }}
                    className="input-field mb-2"
                  >
                    <option value="">-- בחר תכונה קיימת או הזן חדשה --</option>
                    {allAttributes.map((att) => (
                      <option key={att.id} value={att.id}>
                        {att.name}
                      </option>
                    ))}
                  </select>
                  <input
                    type="text"
                    value={attr.name}
                    onChange={(e) => {
                      updateAttribute(index, 'name', e.target.value);
                      updateAttribute(index, 'id', 0);
                    }}
                    className="input-field"
                    placeholder="e.g., Color, Size"
                  />
                </div>
                <div className="flex items-end gap-2">
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={attr.variation || false}
                      onChange={(e) => updateAttribute(index, 'variation', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{t('usedForVariations')}</span>
                  </label>
                  <label className="flex items-center space-x-2">
                    <input
                      type="checkbox"
                      checked={attr.visible !== false}
                      onChange={(e) => updateAttribute(index, 'visible', e.target.checked)}
                      className="rounded"
                    />
                    <span className="text-sm text-gray-700">{t('visibleOnProductPage')}</span>
                  </label>
                  <button
                    type="button"
                    onClick={() => removeAttribute(index)}
                    className="text-orange-600 hover:text-orange-700 p-2"
                  >
                    <Trash className="w-[18px] h-[18px]" />
                  </button>
                </div>
              </div>

              <div>
                <label className={`block text-sm font-medium text-gray-700 mb-2 text-right`}>
                  {t('attributeValues')}
                </label>
                <div className="flex flex-wrap gap-2 mb-2">
                  {attr.options?.map((option, optIndex) => (
                    <span
                      key={optIndex}
                      className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-gray-100 text-gray-800"
                    >
                      {option}
                      <button
                        type="button"
                        onClick={() => removeAttributeOption(index, optIndex)}
                        className="ml-2 text-orange-600 hover:text-orange-700"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    </span>
                  ))}
                </div>
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder={t('addValue')}
                    className="input-field flex-1"
                    onKeyPress={(e) => {
                      if (e.key === 'Enter') {
                        e.preventDefault();
                        const value = e.target.value.trim();
                        if (value) {
                          addAttributeOption(index, value);
                          e.target.value = '';
                        }
                      }
                    }}
                  />
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* Variations Section */}
      <div className="space-y-4 border-t pt-6">
        <h3 className={`text-lg font-semibold text-gray-800 text-right`}>
          {t('variations')}
        </h3>
        {formData.type === 'variable' ? (
          <div>
            <p className="text-gray-600 mb-4">
              {isRTL 
                ? 'וריאציות יווצרו אוטומטית על בסיס התכונות שהוגדרו. שמור את המוצר כדי ליצור וריאציות.'
                : 'Variations will be created automatically based on defined attributes. Save the product to generate variations.'}
            </p>
            {formData.attributes.filter(attr => attr.variation).length === 0 && (
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                <p className="text-yellow-800 text-sm">
                  {isRTL 
                    ? 'אנא הגדר תכונות עם אפשרות "שימוש בוריאציות" בשלב התכונות כדי ליצור וריאציות.'
                    : 'Please define attributes with "Used for Variations" enabled in the Attributes step to create variations.'}
                </p>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-primary-50 border border-primary-200 rounded-lg p-4">
            <p className="text-primary-800">
              {isRTL 
                ? 'וריאציות זמינות רק עבור מוצרים משתנים. שנה את סוג המוצר ל"משתנה" בשלב הכללי כדי להשתמש בוריאציות.'
                : 'Variations are only available for variable products. Change the product type to "Variable" in the General step to use variations.'}
            </p>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductModalAttributesStep;

