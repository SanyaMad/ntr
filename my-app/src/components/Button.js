import React, { useState } from 'react';
import PropTypes from 'prop-types';

const Button = ({
  children,
  title,
  onClick,
  disabled = false,
  loading = false,
  variant = 'primary',
  size = 'medium',
  fullWidth = false,
  icon,
  iconPosition = 'left',
  style,
  className = '',
  type = 'button',
  ariaLabel,
  ripple = true,
  as = 'button'
}) => {
  const [isRippling, setIsRippling] = useState(false);
  const [coords, setCoords] = useState({ x: -1, y: -1 });

  // Стили для разных вариантов кнопок
  const variants = {
    primary: {
      backgroundColor: 'var(--primary, #1976d2)',
      color: 'var(--on-primary, white)',
      border: 'none',
      hoverBg: 'var(--primary-dark, #1565c0)',
      activeBg: 'var(--primary-darker, #0d47a1)'
    },
    secondary: {
      backgroundColor: 'transparent',
      color: 'var(--primary, #1976d2)',
      border: '1px solid var(--primary, #1976d2)',
      hoverBg: 'var(--primary-light, #e3f2fd)',
      activeBg: 'var(--primary-lighter, #bbdefb)'
    },
    danger: {
      backgroundColor: 'var(--error, #d32f2f)',
      color: 'var(--on-error, white)',
      border: 'none',
      hoverBg: 'var(--error-dark, #c62828)',
      activeBg: 'var(--error-darker, #b71c1c)'
    },
    success: {
      backgroundColor: 'var(--success, #2e7d32)',
      color: 'var(--on-success, white)',
      border: 'none',
      hoverBg: 'var(--success-dark, #1b5e20)',
      activeBg: 'var(--success-darker, #1b5e20)'
    },
    text: {
      backgroundColor: 'transparent',
      color: 'var(--primary, #1976d2)',
      border: 'none',
      hoverBg: 'var(--primary-light, #e3f2fd)',
      activeBg: 'var(--primary-lighter, #bbdefb)'
    }
  };

  // Стили для разных размеров
  const sizes = {
    small: {
      padding: '4px 8px',
      fontSize: '12px',
      height: '28px',
      borderRadius: '4px'
    },
    medium: {
      padding: '8px 16px',
      fontSize: '14px',
      height: '36px',
      borderRadius: '6px'
    },
    large: {
      padding: '12px 24px',
      fontSize: '16px',
      height: '44px',
      borderRadius: '8px'
    }
  };

  const variantStyles = variants[variant] || variants.primary;
  const sizeStyles = sizes[size] || sizes.medium;

  const handleClick = (e) => {
    if (!disabled && !loading && ripple) {
      setIsRippling(true);
      setCoords({
        x: e.clientX - e.target.offsetLeft,
        y: e.clientY - e.target.offsetTop
      });

      setTimeout(() => {
        setIsRippling(false);
      }, 600);
    }

    if (onClick && !disabled && !loading) {
      onClick(e);
    }
  };

  const Element = as;

  return (
    <Element
      type={type}
      onClick={handleClick}
      disabled={disabled || loading}
      aria-label={ariaLabel || title}
      aria-busy={loading}
      className={`button ${className} ${variant} ${size} ${fullWidth ? 'full-width' : ''}`}
      style={{
        position: 'relative',
        display: 'inline-flex',
        alignItems: 'center',
        justifyContent: 'center',
        gap: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        outline: 'none',
        transition: 'all 0.2s ease',
        overflow: 'hidden',
        width: fullWidth ? '100%' : 'auto',
        opacity: disabled ? 0.7 : 1,
        ...variantStyles,
        ...sizeStyles,
        ...style
      }}
    >
      <div style={{ 
        display: 'flex', 
        alignItems: 'center', 
        gap: '8px',
        opacity: loading ? 0 : 1 
      }}>
        {icon && iconPosition === 'left' && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size === 'small' ? '16px' : '20px',
            height: size === 'small' ? '16px' : '20px'
          }}>
            {icon}
          </span>
        )}
        {children || title}
        {icon && iconPosition === 'right' && (
          <span style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            width: size === 'small' ? '16px' : '20px',
            height: size === 'small' ? '16px' : '20px'
          }}>
            {icon}
          </span>
        )}
      </div>

      {loading && (
        <div style={{
          position: 'absolute',
          left: '50%',
          top: '50%',
          transform: 'translate(-50%, -50%)',
          width: size === 'small' ? '16px' : '20px',
          height: size === 'small' ? '16px' : '20px',
          borderRadius: '50%',
          border: `2px solid ${variantStyles.color}`,
          borderTopColor: 'transparent',
          animation: 'spin 0.8s linear infinite'
        }} />
      )}

      {isRippling && ripple && (
        <span
          style={{
            position: 'absolute',
            borderRadius: '50%',
            transform: 'scale(0)',
            animation: 'ripple 0.6s linear',
            backgroundColor: 'rgba(255, 255, 255, 0.7)',
            width: '100%',
            height: '100%',
            left: coords.x,
            top: coords.y
          }}
        />
      )}

      <style>
        {`
          .button {
            font-family: var(--font-family, -apple-system, system-ui, BlinkMacSystemFont, 'Segoe UI', Roboto);
            font-weight: 500;
            text-decoration: none;
            user-select: none;
            -webkit-tap-highlight-color: transparent;
          }
          
          .button:focus-visible {
            outline: 2px solid var(--primary);
            outline-offset: 2px;
          }

          @keyframes ripple {
            to {
              transform: scale(4);
              opacity: 0;
            }
          }

          @keyframes spin {
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }
        `}
      </style>
    </Element>
  );
};

Button.propTypes = {
  children: PropTypes.node,
  title: PropTypes.string,
  onClick: PropTypes.func,
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  variant: PropTypes.oneOf(['primary', 'secondary', 'danger', 'success', 'text']),
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  fullWidth: PropTypes.bool,
  icon: PropTypes.node,
  iconPosition: PropTypes.oneOf(['left', 'right']),
  style: PropTypes.object,
  className: PropTypes.string,
  type: PropTypes.oneOf(['button', 'submit', 'reset']),
  ariaLabel: PropTypes.string,
  ripple: PropTypes.bool,
  as: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.elementType
  ])
};

export default React.memo(Button);