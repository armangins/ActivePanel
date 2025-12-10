import { memo } from 'react';
import { PackageIcon, LayersIcon } from '../../../../icons';
import { CheckCircleIcon as CheckCircle } from '@heroicons/react/24/outline';
import { useLanguage } from '../../../../../contexts/LanguageContext';

/**
 * ProductTypeSelector Component
 * 
 * A smart and dynamic product type selector that allows users to choose
 * between 'simple' and 'variable' product types.
 * 
 * @param {string} productType - Currently selected type: 'simple' or 'variable'
 * @param {function} onTypeChange - Callback function when type changes (receives: 'simple' | 'variable')
 * @param {boolean} disabled - Whether the selector is disabled (default: false)
 * @param {string} className - Additional CSS classes for the container
 * @param {boolean} showHelpText - Whether to show the help text below (default: true)
 */
const ProductTypeSelector = ({
  productType,
  onTypeChange,
  disabled = false,
  className = '',
  showHelpText = true,
}) => {
  const { t } = useLanguage();

  // Product type options configuration
  const typeOptions = [
    {
      value: 'simple',
      icon: PackageIcon,
      label: t('simple') || 'פשוט',
      description: t('simpleProductDesc') || 'מוצר יחיד',
      helpText: t('simpleProductDescFull') || 'מוצר פשוט עם מחיר ומלאי יחיד. מתאים למוצרים ללא אפשרויות שונות.',
    },
    {
      value: 'variable',
      icon: LayersIcon,
      label: t('variable') || 'משתנה',
      description: t('variableProductDesc') || 'וריאציות',
      helpText: t('variableProductDescFull') || 'מוצר משתנה מאפשר יצירת וריאציות שונות (גודל, צבע וכו\')  <br/> עם מחירים ומלאי שונים לכל וריאציה.',
    },
  ];

  const handleTypeSelect = (type) => {
    if (!disabled && productType !== type) {
      onTypeChange(type);
    }
  };

  const selectedOption = typeOptions.find(option => option.value === productType);

  return (
    <div className={className}>
      <label className="block text-sm font-medium text-gray-700 mb-2 text-right">
        {t('productType') || 'סוג מוצר'} <span className="text-orange-500">*</span>
      </label>

      <div className="grid grid-cols-2 gap-3">
        {typeOptions.map((option) => {
          const Icon = option.icon;
          const isSelected = productType === option.value;

          return (
            <button
              key={option.value}
              type="button"
              onClick={() => handleTypeSelect(option.value)}
              disabled={disabled}
              className={`
                p-4 border-2 rounded-lg transition-all text-right 
                flex flex-col items-center gap-2
                ${isSelected
                  ? 'border-primary-500 bg-primary-50 text-primary-700'
                  : 'border-gray-200 bg-white text-gray-700 hover:border-gray-300'
                }
                ${disabled ? 'opacity-50 cursor-not-allowed' : 'cursor-pointer'}
              `.trim()}
              dir="rtl"
              aria-pressed={isSelected}
              aria-label={`${option.label}: ${option.description}`}
            >
              <Icon
                size={32}
                className={isSelected ? 'text-primary-600' : 'text-gray-400'}
                autoplay={isSelected}
                isAnimated={true}
              />

              <div className="flex flex-col items-center gap-1">
                <span className="font-semibold text-sm">{option.label}</span>
                <span className="text-xs text-gray-500 text-center">
                  {option.description}
                </span>
              </div>

              {isSelected && (
                <div
                  className="w-5 h-5 rounded-full bg-primary-500 flex items-center justify-center"
                  aria-hidden="true"
                >
                  <CheckCircle className="w-3.5 h-3.5 text-white" />
                </div>
              )}
            </button>
          );
        })}
      </div>

      {showHelpText && selectedOption && (
        <p className="text-xs text-orange-500 mt-2 text-right font-title" role="note">
          {selectedOption.helpText.split('<br/>').map((line, index, array) => (
            <span key={index}>
              {line}
              {index < array.length - 1 && <br />}
            </span>
          ))}
        </p>
      )}
    </div>
  );
};

export default memo(ProductTypeSelector);
