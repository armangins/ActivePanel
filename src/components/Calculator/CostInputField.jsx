import { useLanguage } from '../../contexts/LanguageContext';
import Input from '../ui/inputs/Input';

/**
 * CostInputField Component
 * 
 * Reusable input field for cost values with validation
 * Uses the new dynamic Input component internally.
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
  return (
    <Input
      id={id}
      name={name}
      label={label}
      type="text"
      inputMode="decimal"
      value={value}
      onChange={onChange}
      onBlur={onBlur}
      error={error}
      required={required}
      leftIcon={Icon}
      prefix="₪"
      showIconOnFocus={true}
      className="[appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
      autoComplete="off"
    />
  );
};

export default CostInputField;

