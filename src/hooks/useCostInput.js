import { useState } from 'react';
import { useLanguage } from '../contexts/LanguageContext';

/**
 * useCostInput Hook
 * 
 * Custom hook for managing cost input fields with validation
 * 
 * @param {string} initialValue - Initial value for the field
 * @param {Function} onValueChange - Callback when value changes (optional)
 * @returns {Object} Object containing value, handlers, and error
 */
const useCostInput = (initialValue = '', onValueChange = null) => {
  const { t } = useLanguage();
  const [value, setValue] = useState(initialValue);
  const [error, setError] = useState('');

  const handleChange = (e) => {
    const newValue = e.target.value;
    if (newValue === '' || /^\d*\.?\d*$/.test(newValue)) {
      setValue(newValue);
      setError('');
      if (onValueChange) {
        onValueChange(newValue);
      }
    } else {
      setError(t('onlyNumbers') || 'רק מספרים');
    }
  };

  const handleBlur = (e) => {
    const num = parseFloat(e.target.value);
    if (!isNaN(num) && num >= 0) {
      const formatted = num.toFixed(2);
      setValue(formatted);
      setError('');
      if (onValueChange) {
        onValueChange(formatted);
      }
    } else if (e.target.value !== '') {
      setValue('');
      setError('');
    }
  };

  const reset = () => {
    setValue('');
    setError('');
  };

  return {
    value,
    error,
    handleChange,
    handleBlur,
    reset,
    setValue,
  };
};

export default useCostInput;

