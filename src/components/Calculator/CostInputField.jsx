import { useState } from 'react';
import { useLanguage } from '../../contexts/LanguageContext';

/**
 * CostInputField Component
 * 
 * Reusable input field for cost values with validation
 * 
 * @param {string} label - Label text for the field
 * @param {React.Component} Icon - Icon component to display
 * @param {string} value - Current value
 * @param {Function} onChange - Change handler
 * @param {Function} onBlur - Blur handler
 * @param {string} error - Error message to display
 * @param {boolean} required - Whether the field is required
 * @param {string} placeholder - Placeholder text
 */
const CostInputField = ({ 
  label, 
  Icon, 
  value, 
  onChange, 
  onBlur, 
  error, 
  required = false,
  id,
  name,
}) => {
  const { t } = useLanguage();
  const [isFocused, setIsFocused] = useState(false);
  const showIcon = !isFocused && !value;
  const fieldId = id || `cost-input-${label?.toLowerCase().replace(/\s+/g, '-') || 'field'}`;
  const fieldName = name || fieldId;

  return (
    <div>
      <label htmlFor={fieldId} className="block text-sm font-medium text-gray-700 mb-2 text-right flex items-center gap-2">
        {Icon && <Icon size={18} className="text-gray-500" />}
        {label} {required && '*'}
      </label>
      <div className="relative">
        <input
          id={fieldId}
          name={fieldName}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={onChange}
          onBlur={(e) => {
            setIsFocused(false);
            if (onBlur) onBlur(e);
          }}
          onFocus={() => setIsFocused(true)}
          className="input-field pl-10 pr-4 text-right [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
          required={required}
          autoComplete="off"
        />
        {showIcon && (
          <span className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 text-lg font-semibold pointer-events-none">₪</span>
        )}
      </div>
      {error && (
        <p className="text-xs text-gray-500 mt-1 text-right">{error}</p>
      )}
    </div>
  );
};

export default CostInputField;

