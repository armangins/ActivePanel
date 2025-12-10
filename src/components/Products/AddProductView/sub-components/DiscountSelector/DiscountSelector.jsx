import { useLanguage } from '../../../../../contexts/LanguageContext';
import { Button } from '../../../../ui';

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
          <Button
            key={discount}
            type="button"
            onClick={() => onDiscountSelect(discount.toString())}
            variant={selectedDiscount === discount.toString() ? 'primary' : 'secondary'}
            className="px-4 py-2"
          >
            {discount}%
          </Button>
        ))}
        {selectedDiscount && (
          <Button
            type="button"
            onClick={onClear}
            variant="ghost"
            className="bg-orange-100 text-orange-700 hover:bg-orange-200"
          >
            {t('clear') || 'נקה'}
          </Button>
        )}
      </div>
    </div>
  );
};

export default DiscountSelector;
