import React from 'react';
import './Button.css';

/**
 * Reusable Button Component
 * 
 * @param {string} variant - Button style variant (primary, secondary, outline, danger)
 * @param {string} size - Button size (sm, md, lg)
 * @param {boolean} fullWidth - Make button full width
 * @param {boolean} disabled - Disable button
 * @param {boolean} loading - Show loading state
 * @param {function} onClick - Click handler
 * @param {React.ReactNode} children - Button content
 * @param {string} className - Additional CSS classes
 */
const Button = ({
  variant = 'primary',
  size = 'md',
  fullWidth = false,
  disabled = false,
  loading = false,
  onClick,
  children,
  className = '',
  type = 'button',
  ...props
}) => {
  const classes = [
    'btn',
    `btn-${variant}`,
    `btn-${size}`,
    fullWidth && 'btn-full-width',
    loading && 'btn-loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button
      type={type}
      className={classes}
      onClick={onClick}
      disabled={disabled || loading}
      {...props}
    >
      {loading ? (
        <span className="btn-spinner">
          <svg className="spinner" viewBox="0 0 24 24">
            <circle
              className="spinner-circle"
              cx="12"
              cy="12"
              r="10"
              fill="none"
              strokeWidth="3"
            />
          </svg>
          Loading...
        </span>
      ) : (
        children
      )}
    </button>
  );
};

export default Button;
