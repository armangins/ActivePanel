import React from 'react';
import { Controller } from 'react-hook-form';
import { Form } from 'antd';

/**
 * FormField Component
 * 
 * Integrates react-hook-form Controller with Ant Design Form.Item
 * This allows using react-hook-form with Ant Design forms seamlessly.
 * 
 * @param {string} name - Field name (required)
 * @param {object} control - Control object from useFormContext or useForm
 * @param {React.Component} children - Input component to render
 * @param {string} label - Field label
 * @param {string} help - Helper text
 * @param {boolean} required - Whether field is required
 * @param {object} rules - Validation rules (react-hook-form format)
 * @param {string} className - Additional CSS classes
 */
export const FormField = ({
  name,
  control,
  children,
  label,
  help,
  required = false,
  rules = {},
  className = '',
  ...formItemProps
}) => {
  return (
    <Controller
      name={name}
      control={control}
      rules={rules}
      render={({ field, fieldState: { error } }) => (
        <Form.Item
          label={label}
          required={required}
          validateStatus={error ? 'error' : ''}
          help={error?.message || help}
          className={className}
          {...formItemProps}
        >
          {typeof children === 'function'
            ? children(field)
            : React.cloneElement(children, {
                ...field,
                ...children.props,
                error: error?.message,
              })
          }
        </Form.Item>
      )}
    />
  );
};

export default FormField;

