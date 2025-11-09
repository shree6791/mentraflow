import React from 'react';
import './FormInput.css';

/**
 * Reusable Form Input Component
 * 
 * @param {string} label - Input label
 * @param {string} type - Input type (text, email, password, number, textarea)
 * @param {string} name - Input name
 * @param {string} value - Input value
 * @param {function} onChange - Change handler
 * @param {string} placeholder - Placeholder text
 * @param {string} error - Error message
 * @param {boolean} required - Mark as required
 * @param {boolean} disabled - Disable input
 * @param {React.ReactNode} icon - Icon component
 * @param {React.ReactNode} rightElement - Element on right (e.g., show/hide password button)
 * @param {string} helperText - Helper text below input
 * @param {number} rows - Rows for textarea
 */
const FormInput = ({
  label,
  type = 'text',
  name,
  value,
  onChange,
  placeholder = '',
  error,
  required = false,
  disabled = false,
  icon,
  rightElement,
  helperText,
  rows = 4,
  className = '',
  ...props
}) => {
  const inputClasses = [
    'form-input',
    error && 'form-input-error',
    icon && 'form-input-with-icon',
    rightElement && 'form-input-with-right',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  const InputComponent = type === 'textarea' ? 'textarea' : 'input';

  return (
    <div className="form-field">
      {label && (
        <label htmlFor={name} className="form-label">
          {label}
          {required && <span className="form-required">*</span>}
        </label>
      )}

      <div className="form-input-wrapper">
        {icon && <span className="form-input-icon">{icon}</span>}

        <InputComponent
          id={name}
          name={name}
          type={type === 'textarea' ? undefined : type}
          value={value}
          onChange={onChange}
          placeholder={placeholder}
          required={required}
          disabled={disabled}
          rows={type === 'textarea' ? rows : undefined}
          className={inputClasses}
          {...props}
        />

        {rightElement && <span className="form-input-right">{rightElement}</span>}
      </div>

      {error && <p className="form-error">{error}</p>}
      {helperText && !error && <p className="form-helper">{helperText}</p>}
    </div>
  );
};

export default FormInput;
