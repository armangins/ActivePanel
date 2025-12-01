import { Input } from '../../../ui/inputs';
import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * ProductBasicInfo Component
 * 
 * Handles product name and category selection.
 */
const ProductBasicInfo = ({ formData, errors, categories, onNameChange, onCategoryChange }) => {
  const { t } = useLanguage();

  return (
    <>
      {/* Product Name */}
      <div>
        <Input
          label={t('productName')}
          type="text"
          value={formData.name}
          onChange={(e) => onNameChange(e.target.value)}
          placeholder={t('enterProductName') || 'Enter product name'}
          error={errors.name}
          maxLength={20}
          required
          helperText={t('max20CharactersNote') || 'Do not exceed 20 characters when entering the product name.'}
        />
      </div>

      {/* Category */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
          {t('category')} <span className="text-orange-500">*</span>
        </label>
        <select
          value={formData.categories[0] || ''}
          onChange={(e) => onCategoryChange(e.target.value ? [parseInt(e.target.value)] : [])}
          className={`input-field text-right ${errors.categories ? 'border-orange-500' : ''}`}
          dir="rtl"
        >
          <option value="">{t('chooseCategory') || 'Choose category'}</option>
          {categories.map(cat => (
            <option key={cat.id} value={cat.id}>{cat.name}</option>
          ))}
        </select>
        {errors.categories && (
          <p className="text-orange-500 text-xs mt-1 text-right">{errors.categories}</p>
        )}
      </div>
    </>
  );
};

export default ProductBasicInfo;

