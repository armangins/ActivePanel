import React, { useState, forwardRef } from 'react';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * Input Component
 * 
 * A dynamic, flexible input component that handles multiple use cases:
 * - Different input types (text, email, password, number, tel, etc.)
 * - Icons (left/right positions)
 * - Labels with optional required indicator
 * - Error messages
 * - Prefix/suffix elements (e.g., currency symbols)
 * - RTL/LTR support
 * - Various sizes
 * - Validation states
 * - Disabled/readonly states
 * 
 * @param {string} type - Input type (text, email, password, number, tel, etc.)
 * @param {string} value - Current input value
 * @param {Function} onChange - Change handler
 * @param {Function} onBlur - Blur handler
 * @param {Function} onFocus - Focus handler
 * @param {string} label - Label text
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message to display
 * @param {string} helperText - Helper text below input
 * @param {boolean} required - Whether field is required
 * @param {boolean} disabled - Whether input is disabled
 * @param {boolean} readOnly - Whether input is read-only
 * @param {React.Component} leftIcon - Icon component to display on the left
 * @param {React.Component} rightIcon - Icon component to display on the right
 * @param {React.ReactNode} prefix - Prefix element (e.g., currency symbol, text)
 * @param {React.ReactNode} suffix - Suffix element (e.g., currency symbol, text)
 * @param {string} size - Input size: 'sm', 'md', 'lg'
 * @param {string} variant - Input variant: 'default', 'filled', 'outlined'
 * @param {string} id - Input ID
 * @param {string} name - Input name attribute
 * @param {string} autoComplete - Autocomplete attribute
 * @param {string} inputMode - Input mode for mobile keyboards
 * @param {number} min - Minimum value (for number inputs)
 * @param {number} max - Maximum value (for number inputs)
 * @param {number} step - Step value (for number inputs)
 * @param {number} maxLength - Maximum length
 * @param {number} minLength - Minimum length
 * @param {string} pattern - Pattern for validation
 * @param {string} className - Additional CSS classes
 * @param {string} containerClassName - Additional CSS classes for container
 * @param {boolean} showIconOnFocus - Whether to show icon only when focused/has value
 * @param {boolean} isRTL - Override RTL (if not provided, uses context)
 */
const Input = forwardRef(({
  type = 'text',
  value, // Removed default '' to allow uncontrolled mode
  onChange,
  onBlur,
  onFocus,
  label,
  placeholder,
  error,
  helperText,
  required = false,
  disabled = false,
  readOnly = false,
  leftIcon,
  rightIcon,
  prefix,
  suffix,
  size = 'md',
  variant = 'default',
  id,
  name,
  autoComplete,
  inputMode,
  min,
  max,
  step,
  maxLength,
  minLength,
  pattern,
  className = '',
  containerClassName = '',
  showIconOnFocus = false,
  isRTL: overrideRTL,
  testId, // Add testId prop for testing
  ...rest
}, ref) => {
  const { isRTL: contextRTL } = useLanguage();
  const isRTL = overrideRTL !== undefined ? overrideRTL : contextRTL;
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  // Generate ID if not provided
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : `input-${Math.random().toString(36).substr(2, 9)}`);

  // Size classes
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-4 py-2 text-base',
    lg: 'px-5 py-3 text-lg',
  };

  // Variant classes
  const variantClasses = {
    default: 'border border-gray-300 focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
    filled: 'bg-gray-50 border border-transparent focus:bg-white focus:border-primary-500 focus:ring-1 focus:ring-primary-500',
    outlined: 'border-2 border-gray-300 focus:border-primary-500',
  };

  // Determine if we should show icons
  const hasValue = value !== undefined && value !== null && value !== '';
  const shouldShowLeftIcon = Boolean(leftIcon) && (!showIconOnFocus || isFocused || hasValue);
  const shouldShowRightIcon = Boolean(rightIcon) && (!showIconOnFocus || isFocused || hasValue);
  const shouldShowPrefix = Boolean(prefix) && (!showIconOnFocus || isFocused || hasValue);
  const shouldShowSuffix = Boolean(suffix) && (!showIconOnFocus || isFocused || hasValue);

  // Icon size classes
  const iconSizeClass = size === 'sm' ? 'w-4 h-4' : size === 'lg' ? 'w-6 h-6' : 'w-5 h-5';

  // Handle password toggle
  const inputType = type === 'password' && showPassword ? 'text' : type;

  // Get padding classes based on size
  // Icons/prefixes/suffixes are absolutely positioned, so default padding is sufficient
  const getPaddingClasses = () => {
    return sizeClasses[size] || sizeClasses.md;
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) {
      onFocus(e);
    }
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) {
      onBlur(e);
    }
  };

  const handleChange = (e) => {
    if (onChange) {
      onChange(e);
    }
  };

  // Create icon elements - use React.createElement for reliability
  let leftIconEl = null;
  if (shouldShowLeftIcon && leftIcon) {
    try {
      if (React.isValidElement(leftIcon)) {
        leftIconEl = leftIcon;
      } else if (typeof leftIcon === 'function') {
        leftIconEl = React.createElement(leftIcon, { className: iconSizeClass });
      }
    } catch (e) {
      // Invalid icon component - skip rendering
      leftIconEl = null;
    }
  }

  let rightIconEl = null;
  if (shouldShowRightIcon && rightIcon && type !== 'password') {
    try {
      if (React.isValidElement(rightIcon)) {
        rightIconEl = rightIcon;
      } else if (typeof rightIcon === 'function') {
        rightIconEl = React.createElement(rightIcon, { className: iconSizeClass });
      }
    } catch (e) {
      // Invalid icon component - skip rendering
      rightIconEl = null;
    }
  }

  return (
    <div className={containerClassName}>
      {/* Label */}
      {label && (
        <label
          htmlFor={inputId}
          className={`block text-sm font-normal text-gray-700 mb-2 ${isRTL ? 'text-right' : 'text-left'}`}
        >
          {label}
          {required && (
            <span className={`text-orange-500 ${isRTL ? 'mr-1' : 'ml-1'}`}>*</span>
          )}
        </label>
      )}

      {/* Input Container */}
      <div className="relative">
        {/* Left Icon (RTL: right side) */}
        {leftIconEl && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} text-gray-400 pointer-events-none`}>
            {leftIconEl}
          </div>
        )}

        {/* Prefix (RTL: right side) */}
        {shouldShowPrefix && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'right-3' : 'left-3'} pointer-events-none`}>
            {typeof prefix === 'string' ? (
              <span className={`text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>{prefix}</span>
            ) : (
              prefix
            )}
          </div>
        )}

        {/* Input Field */}
        <input
          ref={ref}
          id={inputId}
          name={name || inputId}
          type={inputType}
          value={value}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          autoComplete={autoComplete}
          inputMode={inputMode}
          min={min}
          max={max}
          step={step}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          className={`
            input-field
            w-full
            ${getPaddingClasses()}
            ${variantClasses[variant]}
            ${isRTL ? 'text-right' : 'text-left'}
            ${error ? 'border-orange-500 focus:border-orange-500 focus:ring-orange-500' : ''}
            ${disabled ? 'bg-gray-100 cursor-not-allowed opacity-60' : ''}
            ${readOnly ? 'bg-gray-50 cursor-default' : ''}
            transition-colors
            ${className}
          `.trim().replace(/\s+/g, ' ')}
          {...rest}
          spellCheck="false"
          autoCorrect="off"
          data-lpignore="true"
          data-1p-ignore
          data-form-type="other"
          data-testid={testId}
        />

        {/* Password Toggle Button */}
        {type === 'password' && value && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 hover:text-gray-600 focus:outline-none`}
            tabIndex={-1}
          >
            {showPassword ? (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
              </svg>
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
              </svg>
            )}
          </button>
        )}

        {/* Right Icon (RTL: left side) */}
        {rightIconEl && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} text-gray-400 pointer-events-none`}>
            {rightIconEl}
          </div>
        )}

        {/* Suffix (RTL: left side) */}
        {shouldShowSuffix && (
          <div className={`absolute top-1/2 transform -translate-y-1/2 ${isRTL ? 'left-3' : 'right-3'} pointer-events-none`}>
            {typeof suffix === 'string' ? (
              <span className={`text-gray-400 ${size === 'sm' ? 'text-sm' : size === 'lg' ? 'text-lg' : 'text-base'}`}>{suffix}</span>
            ) : (
              suffix
            )}
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <p className={`text-xs text-orange-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          {error}
        </p>
      )}

      {/* Helper Text */}
      {helperText && !error && (
        <p className={`text-xs text-gray-500 mt-1 ${isRTL ? 'text-right' : 'text-left'}`}>
          {helperText}
        </p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;

