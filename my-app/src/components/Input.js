import React, { forwardRef, useState } from 'react';
import PropTypes from 'prop-types';

const styles = `
  .custom-input::placeholder {
    color: var(--text-secondary);
    opacity: 0.7;
  }
`;

const styleSheet = document.createElement("style");
styleSheet.innerText = styles;
document.head.appendChild(styleSheet);

const Input = forwardRef(({
  type = 'text',
  value,
  onChange,
  label,
  placeholder,
  error,
  success,
  disabled = false,
  required = false,
  icon,
  rightIcon,
  size = 'medium',
  variant = 'outlined',
  maxLength,
  minLength,
  pattern,
  className,
  style,
  onFocus,
  onBlur,
  ...props
}, ref) => {
  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const sizeStyles = {
    small: {
      height: '28px',
      fontSize: '12px',
      padding: '4px 8px',
      iconSize: 16
    },
    medium: {
      height: '36px',
      fontSize: '14px',
      padding: '6px 12px',
      iconSize: 20
    },
    large: {
      height: '44px',
      fontSize: '16px',
      padding: '8px 16px',
      iconSize: 24
    }
  }[size];

  const getVariantStyles = () => {
    switch (variant) {
      case 'filled':
        return {
          backgroundColor: disabled ? 'var(--background-light)' : 'var(--background)',
          border: 'none',
          ':focus-within': {
            backgroundColor: 'white'
          }
        };
      case 'underlined':
        return {
          backgroundColor: 'transparent',
          border: 'none',
          borderBottom: `1px solid ${
            disabled ? 'var(--border)' :
            error ? 'var(--error)' :
            success ? 'var(--success)' :
            isFocused ? 'var(--primary)' : 'var(--border)'
          }`,
          borderRadius: 0
        };
      default: // outlined
        return {
          backgroundColor: disabled ? 'var(--background-light)' : 'white',
          border: `1px solid ${
            disabled ? 'var(--border)' :
            error ? 'var(--error)' :
            success ? 'var(--success)' :
            isFocused ? 'var(--primary)' : 'var(--border)'
          }`,
          borderRadius: '6px'
        };
    }
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    if (onFocus) onFocus(e); // Исправлено: добавлено условие вызова onFocus
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    if (onBlur) onBlur(e); // Исправлено: добавлено условие вызова onBlur
  };

  return (
    <div
      className={className}
      style={{
        position: 'relative',
        width: '100%',
        ...style
      }}
    >
      {label && (
        <label
          style={{
            display: 'block',
            marginBottom: '4px',
            fontSize: '14px',
            color: disabled ? 'var(--text-disabled)' : 'var(--text)',
            transition: 'color 0.2s ease'
          }}
        >
          {label}
          {required && <span style={{ color: 'var(--error)' }}>*</span>}
        </label>
      )}

      <div
        style={{
          position: 'relative',
          display: 'flex',
          alignItems: 'center',
          height: sizeStyles.height,
          ...getVariantStyles(),
          transition: 'all 0.2s ease',
          boxShadow: isFocused
            ? error
              ? '0 0 0 2px var(--error-light)'
              : success
                ? '0 0 0 2px var(--success-light)'
                : '0 0 0 2px var(--primary-light)'
            : 'none'
        }}
      >
        {icon && (
          <div style={{
            display: 'flex',
            alignItems: 'center',
            padding: '0 8px',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)'
          }}>
            {React.cloneElement(icon, {
              width: sizeStyles.iconSize,
              height: sizeStyles.iconSize
            })}
          </div>
        )}

        <input
          ref={ref}
          type={type === 'password' ? (showPassword ? 'text' : 'password') : type}
          value={value}
          onChange={onChange}
          disabled={disabled}
          required={required}
          placeholder={placeholder}
          maxLength={maxLength}
          minLength={minLength}
          pattern={pattern}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className="custom-input"
          style={{
            width: '100%',
            height: '100%',
            padding: sizeStyles.padding,
            paddingLeft: icon ? '0' : sizeStyles.padding,
            paddingRight: (rightIcon || type === 'password') ? '32px' : sizeStyles.padding,
            border: 'none',
            outline: 'none',
            backgroundColor: 'transparent',
            fontSize: sizeStyles.fontSize,
            color: disabled ? 'var(--text-disabled)' : 'var(--text)',
            cursor: disabled ? 'not-allowed' : 'text'
          }}
          {...props}
        />

        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            style={{
              position: 'absolute',
              right: '8px',
              padding: '4px',
              background: 'none',
              border: 'none',
              cursor: disabled ? 'not-allowed' : 'pointer',
              color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            {showPassword ? (
              <svg width={sizeStyles.iconSize} height={sizeStyles.iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"/>
                <line x1="1" y1="1" x2="23" y2="23"/>
              </svg>
            ) : (
              <svg width={sizeStyles.iconSize} height={sizeStyles.iconSize} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"/>
                <circle cx="12" cy="12" r="3"/>
              </svg>
            )}
          </button>
        )}

        {rightIcon && (
          <div style={{
            position: 'absolute',
            right: '12px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            color: disabled ? 'var(--text-disabled)' : 'var(--text-secondary)'
          }}>
            {React.cloneElement(rightIcon, {
              width: sizeStyles.iconSize,
              height: sizeStyles.iconSize
            })}
          </div>
        )}
      </div>

      {error && (
        <div
          style={{
            fontSize: '12px',
            color: 'var(--error)',
            marginTop: '4px'
          }}
        >
          {error}
        </div>
      )}
    </div>
  );
});

Input.propTypes = {
  value: PropTypes.string,
  onChange: PropTypes.func,
  type: PropTypes.oneOf(['text', 'password', 'email', 'number', 'tel', 'url']),
  label: PropTypes.string,
  placeholder: PropTypes.string,
  error: PropTypes.string,
  success: PropTypes.bool,
  disabled: PropTypes.bool,
  required: PropTypes.bool,
  icon: PropTypes.node,
  rightIcon: PropTypes.node,
  maxLength: PropTypes.number,
  minLength: PropTypes.number,
  pattern: PropTypes.string,
  className: PropTypes.string,
  style: PropTypes.object,
  onFocus: PropTypes.func,
  onBlur: PropTypes.func,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  variant: PropTypes.oneOf(['outlined', 'filled', 'underlined'])
};

export default React.memo(Input);
