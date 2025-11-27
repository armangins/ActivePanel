import { Plus, Trash2 } from 'lucide-react';
import { useLanguage } from '../../contexts/LanguageContext';
import CostInputField from './CostInputField';

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
          <Plus size={18} className="text-gray-500" />
          {t('additionalCustomCosts') || 'עלויות נוספות/מותאמות אישית (אופציונלי)'}
        </label>
        <button
          type="button"
          onClick={onAdd}
          className="btn-secondary text-xs py-1 px-2 flex items-center gap-1"
        >
          <Plus size={14} />
          <span>{t('addCost') || 'הוסף עלות'}</span>
        </button>
      </div>
      <div className="space-y-2">
        {customCosts.map((cost, index) => (
          <div key={cost.id} className="space-y-1">
            <div className="flex gap-2 flex-row-reverse">
              <div className="flex-1">
                <input
                  id={`custom-cost-amount-${cost.id}`}
                  name={`customCostAmount_${cost.id}`}
                  type="text"
                  inputMode="decimal"
                  value={cost.amount}
                  onChange={(e) => handleAmountChange(cost.id, e.target.value)}
                  onBlur={(e) => handleAmountBlur(cost.id, e.target.value)}
                  className="input-field w-full text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  placeholder={t('amount') || 'סכום'}
                  autoComplete="off"
                />
                {validationErrors[`customCost_${cost.id}`] && (
                  <p className="text-xs text-gray-500 mt-1 text-right">{validationErrors[`customCost_${cost.id}`]}</p>
                )}
              </div>
              <input
                id={`custom-cost-name-${cost.id}`}
                name={`customCostName_${cost.id}`}
                type="text"
                value={cost.name}
                onChange={(e) => onUpdate(cost.id, 'name', e.target.value)}
                className="input-field flex-1 text-right"
                placeholder={t('costName') || 'שם העלות'}
                autoComplete="off"
              />
              {customCosts.length > 1 && (
                <button
                  type="button"
                  id={`remove-custom-cost-${cost.id}`}
                  aria-label={`${t('remove') || 'הסר'} ${cost.name || t('costName') || 'עלות'}`}
                  onClick={() => onRemove(cost.id)}
                  className="p-2 text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                  title={t('remove') || 'הסר'}
                >
                  <Trash2 size={18} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CustomCostsInput;

