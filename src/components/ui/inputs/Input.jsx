import React, { forwardRef } from 'react';
import { Input as AntInput, InputNumber, Space } from 'antd';
import { useLanguage } from '../../../contexts/LanguageContext';

/**
 * Input Component - Ant Design wrapper
 * 
 * A dynamic, flexible input component that handles multiple use cases.
 */
const Input = forwardRef(({
  type = 'text',
  value,
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
  size = 'lg',
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
  testId,
  allowSpecialChars = true, // New prop to control special character input
  ...rest
}, ref) => {
  const { isRTL: contextRTL } = useLanguage();
  const isRTL = overrideRTL !== undefined ? overrideRTL : contextRTL;

  // Generate ID if not provided
  const inputId = id || (label ? `input-${label.toLowerCase().replace(/\s+/g, '-')}` : `input-${Math.random().toString(36).substr(2, 9)}`);

  // Map sizes
  const sizeMap = {
    sm: 'small',
    md: 'middle',
    lg: 'large',
  };

  // Helper to convert icon prop to React element
  const renderIcon = (icon) => {
    if (!icon) return undefined;
    if (React.isValidElement(icon)) return icon;
    if (typeof icon === 'function') {
      const IconComponent = icon;
      return <IconComponent />;
    }
    return undefined;
  };

  // Handle number input
  if (type === 'number') {
    const leftIconElement = renderIcon(leftIcon);
    const rightIconElement = renderIcon(rightIcon);
    const hasAddons = leftIconElement || rightIconElement;

    const inputNumber = (
      <InputNumber
        ref={ref}
        id={inputId}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyPress={(e) => {
          // Allow only numbers, decimal point, and minus sign
          const allowedChars = /[0-9.-]/;
          if (!allowedChars.test(e.key)) {
            e.preventDefault();
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        min={min}
        max={max}
        step={step}
        size={sizeMap[size] || 'large'}
        prefix={prefix}
        suffix={suffix}
        className={className}
        style={{ width: hasAddons ? undefined : '100%', direction: isRTL ? 'rtl' : 'ltr', verticalAlign: 'middle' }}
        status={error ? 'error' : ''}
        controls={false}
        {...(() => {
          const { addonAfter, addonBefore, ...validRest } = rest;
          return validRest;
        })()}
      />
    );

    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={inputId} style={{ display: 'block', marginBottom: 8 }}>
            {label}
            {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
          </label>
        )}
        {hasAddons ? (
          <Space.Compact style={{ width: '100%', direction: isRTL ? 'rtl' : 'ltr' }}>
            {leftIconElement}
            {inputNumber}
            {rightIconElement}
          </Space.Compact>
        ) : (
          inputNumber
        )}
        {error && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{error}</div>}
        {helperText && !error && <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>{helperText}</div>}
      </div>
    );
  }

  // Handle password input
  if (type === 'password') {
    return (
      <div className={containerClassName}>
        {label && (
          <label htmlFor={inputId} style={{ display: 'block', marginBottom: 8 }}>
            {label}
            {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
          </label>
        )}
        <AntInput.Password
          ref={ref}
          id={inputId}
          name={name || inputId}
          value={value}
          onChange={onChange}
          onBlur={onBlur}
          onFocus={onFocus}
          placeholder={placeholder}
          disabled={disabled}
          required={required}
          autoComplete={autoComplete}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          size={sizeMap[size] || 'large'}
          prefix={prefix || renderIcon(leftIcon)}
          suffix={suffix || renderIcon(rightIcon)}
          className={className}
          style={{ direction: isRTL ? 'rtl' : 'ltr', verticalAlign: 'middle' }}
          status={error ? 'error' : ''}
          data-testid={testId}
          {...rest}
        />
        {error && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{error}</div>}
        {helperText && !error && <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>{helperText}</div>}
      </div>
    );
  }

  // Handle text input
  return (
    <div className={containerClassName}>
      {label && (
        <label htmlFor={inputId} style={{ display: 'block', marginBottom: 8 }}>
          {label}
          {required && <span style={{ color: '#ff4d4f', marginLeft: 4 }}>*</span>}
        </label>
      )}
      <AntInput
        ref={ref}
        id={inputId}
        name={name || inputId}
        type={type}
        value={value}
        onChange={onChange}
        onBlur={onBlur}
        onFocus={onFocus}
        onKeyPress={(e) => {
          if (!allowSpecialChars) {
            // Allow: letters (Hebrew/English), numbers, spaces, hyphens, underscores
            const allowedChars = /^[a-zA-Z0-9\u0590-\u05FF\s\-_]$/;
            if (!allowedChars.test(e.key)) {
              e.preventDefault();
            }
          }
        }}
        placeholder={placeholder}
        disabled={disabled}
        readOnly={readOnly}
        required={required}
        autoComplete={autoComplete}
        inputMode={inputMode}
        maxLength={maxLength}
        minLength={minLength}
        pattern={pattern}
        size={sizeMap[size] || 'large'}
        prefix={prefix || renderIcon(leftIcon)}
        suffix={suffix || renderIcon(rightIcon)}
        className={className}
        style={{ direction: isRTL ? 'rtl' : 'ltr', verticalAlign: 'middle' }}
        status={error ? 'error' : ''}
        data-testid={testId}
        {...rest}
      />
      {error && <div style={{ color: '#ff4d4f', fontSize: 12, marginTop: 4 }}>{error}</div>}
      {helperText && !error && <div style={{ color: '#8c8c8c', fontSize: 12, marginTop: 4 }}>{helperText}</div>}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;
