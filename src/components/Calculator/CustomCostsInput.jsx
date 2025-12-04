import { TrashIcon as Trash2, PlusIcon as Plus } from '@heroicons/react/24/outline';
import { useLanguage } from '../../contexts/LanguageContext';
import { Input } from '../ui/inputs';
import { Button } from '../ui';

/**
 * CustomCostsInput Component
 * 
 * Component for managing custom/additional costs
 * 
 * @param {Array} customCosts - Array of custom cost objects
 * @param {Function} onAdd - Handler to add a new cost
 * @param {Function} onRemove - Handler to remove a cost
 * @param {Function} onUpdate - Handler to update a cost
 * @param {Object} validationErrors - Validation errors object
 * @param {Function} setValidationErrors - Function to set validation errors
 */
const CustomCostsInput = ({
  customCosts,
  onAdd,
  onRemove,
  onUpdate,
  validationErrors,
  setValidationErrors
}) => {
  const { t } = useLanguage();

  const handleAmountChange = (id, value) => {
    if (value === '' || /^\d*\.?\d*$/.test(value)) {
      onUpdate(id, 'amount', value);
      setValidationErrors(prev => ({ ...prev, [`customCost_${id}`]: '' }));
    } else {
      setValidationErrors(prev => ({ ...prev, [`customCost_${id}`]: t('onlyNumbers') || 'רק מספרים' }));
    }
  };

  const handleAmountBlur = (id, value) => {
    const num = parseFloat(value);
    if (!isNaN(num) && num >= 0) {
      onUpdate(id, 'amount', num.toFixed(2));
      setValidationErrors(prev => ({ ...prev, [`customCost_${id}`]: '' }));
    } else if (value !== '') {
      onUpdate(id, 'amount', '');
      setValidationErrors(prev => ({ ...prev, [`customCost_${id}`]: '' }));
    }
  };

  return (
    <div>
      <div className="flex items-center justify-between mb-2">
        <label className="block text-sm font-medium text-gray-700 text-right flex items-center gap-2">
          <Plus className="w-[18px] h-[18px] text-gray-500" />
          {t('additionalCustomCosts') || 'עלויות נוספות/מותאמות אישית (אופציונלי)'}
        </label>
        <Button
          type="button"
          onClick={onAdd}
          variant="secondary"
          size="sm"
          className="flex items-center gap-1"
        >
          <Plus className="w-3.5 h-3.5" />
          <span>{t('addCost') || 'הוסף עלות'}</span>
        </Button>
      </div>
      <div className="space-y-2">
        {customCosts.map((cost, index) => (
          <div key={cost.id} className="space-y-1">
            <div className="flex gap-2 flex-row-reverse">
              <div className="flex-1">
                <Input
                  id={`custom-cost-amount-${cost.id}`}
                  name={`customCostAmount_${cost.id}`}
                  type="text"
                  inputMode="decimal"
                  value={cost.amount}
                  onChange={(e) => handleAmountChange(cost.id, e.target.value)}
                  onBlur={(e) => handleAmountBlur(cost.id, e.target.value)}
                  placeholder={t('amount') || 'סכום'}
                  prefix="₪"
                  error={validationErrors[`customCost_${cost.id}`]}
                  className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  autoComplete="off"
                />
              </div>
              <div className="flex-1">
                <Input
                  id={`custom-cost-name-${cost.id}`}
                  name={`customCostName_${cost.id}`}
                  type="text"
                  value={cost.name}
                  onChange={(e) => onUpdate(cost.id, 'name', e.target.value)}
                  placeholder={t('costName') || 'שם העלות'}
                  autoComplete="off"
                />
              </div>
              {customCosts.length > 1 && (
                <Button
                  type="button"
                  id={`remove-custom-cost-${cost.id}`}
                  aria-label={`${t('remove') || 'הסר'} ${cost.name || t('costName') || 'עלות'}`}
                  onClick={() => onRemove(cost.id)}
                  variant="ghost"
                  size="icon"
                  className="text-orange-600 hover:bg-orange-50"
                  title={t('remove') || 'הסר'}
                >
                  <Trash2 className="w-[18px] h-[18px]" />
                </Button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCostsInput;

