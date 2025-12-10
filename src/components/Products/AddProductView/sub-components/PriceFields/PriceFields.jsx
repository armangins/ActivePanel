import { CalculatorIcon as Calculator, CalendarIcon as Calendar } from '@heroicons/react/24/outline';
import { Input } from '../../../../ui/inputs';
import { Button } from '../../../../ui';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * PriceFields Component
 * 
 * Handles regular price and sale price inputs with calculator and schedule buttons.
 */
const PriceFields = ({
  formData,
  errors,
  onRegularPriceChange,
  onSalePriceChange,
  onCalculatorClick,
  onScheduleClick
}) => {
  const { t, isRTL } = useLanguage();

  return (
    <div className="grid grid-cols-2 gap-4">
      {/* Regular Price */}
      <div>
        <div className={`flex gap-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex-1">
            <Input
              label={t('regularPrice')}
              type="number"
              value={formData.regular_price}
              onChange={(e) => onRegularPriceChange(e.target.value)}
              placeholder="0.00"
              error={errors.regular_price?.message}
              step="0.01"
              min="0"
              className="mr-4 pr-7"
              required
              suffix="₪"
              testId="regular-price-input"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onCalculatorClick}
            className={`flex items-center justify-center gap-2 whitespace-nowrap ${isRTL ? 'flex-row-reverse' : 'flex-row'} self-end`}
            title={t('smartPricing') || 'מחיר חכם'}
          >
            <Calculator className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline text-center">{t('smartPricing') || 'מחיר חכם'}</span>
          </Button>
        </div>
      </div>

      {/* Sale Price */}
      <div>
        <div className={`flex gap-2 ${isRTL ? 'flex-row' : 'flex-row-reverse'}`}>
          <div className="flex-1">
            <Input
              label={t('salePrice')}
              type="number"
              value={formData.sale_price}
              onChange={(e) => onSalePriceChange(e.target.value)}
              placeholder="0.00"
              step="0.01"
              min="0"
              className="mr-4 pr-7"
              suffix="₪"
              testId="sale-price-input"
            />
          </div>
          <Button
            type="button"
            variant="secondary"
            onClick={onScheduleClick}
            className={`flex items-center justify-center gap-2 whitespace-nowrap ${isRTL ? 'flex-row-reverse' : 'flex-row'} self-end`}
            title={t('schedule') || 'תזמון'}
          >
            <Calendar className="w-[18px] h-[18px]" />
            <span className="hidden sm:inline text-center">{t('schedule') || 'תזמון'}</span>
          </Button>
        </div>
      </div>
    </div>
  );
};

export default PriceFields;

