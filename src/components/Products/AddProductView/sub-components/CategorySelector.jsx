import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * CategorySelector Component
 * 
 * Handles category selection for the product.
 */
const CategorySelector = ({ value, categories, error, onChange }) => {
  const { t } = useLanguage();

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
        {t('category')} <span className="text-orange-500">*</span>
      </label>
      <select
        value={value || ''}
        onChange={(e) => onChange(e.target.value ? [parseInt(e.target.value)] : [])}
        className={`input-field text-right ${error ? 'border-orange-500' : ''}`}
        dir="rtl"
      >
        <option value="">{t('chooseCategory') || 'Choose category'}</option>
        {categories.map(cat => (
          <option key={cat.id} value={cat.id}>{cat.name}</option>
        ))}
      </select>
      {error && (
        <p className="text-orange-500 text-xs mt-1 text-right">{error}</p>
      )}
    </div>
  );
};

export default CategorySelector;

