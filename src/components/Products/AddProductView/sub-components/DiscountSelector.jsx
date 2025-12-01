import { useLanguage } from '../../../../contexts/LanguageContext';

/**
 * DiscountSelector Component
 * 
 * Allows user to select discount percentage (5, 10, 15, 20, 50%).
 */
const DiscountSelector = ({ selectedDiscount, regularPrice, onDiscountSelect, onClear }) => {
  const { t } = useLanguage();

  const discountOptions = [5, 10, 15, 20, 50];

  return (
    <div>
      <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
        {t('selectDiscount') || 'בחר אחוז הנחה'}
      </label>
      <div className="flex gap-2 flex-wrap flex-row">
        {discountOptions.map((discount) => (
          <button
            key={discount}
            type="button"
            onClick={() => onDiscountSelect(discount.toString())}
            className={`px-4 py-2 rounded-lg transition-colors text-sm font-medium ${
              selectedDiscount === discount.toString()
                ? 'bg-primary-500 text-white hover:bg-primary-600'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            {discount}%
          </button>
        ))}
        {selectedDiscount && (
          <button
            type="button"
            onClick={onClear}
            className="px-4 py-2 rounded-lg transition-colors text-sm font-medium bg-orange-100 text-orange-700 hover:bg-orange-200"
          >
            {t('clear') || 'נקה'}
          </button>
        )}
      </div>
    </div>
  );
};

export default DiscountSelector;
