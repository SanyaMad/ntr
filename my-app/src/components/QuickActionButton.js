import React, { useState, useCallback, useEffect } from 'react';
import PropTypes from 'prop-types';

const QuickActionButton = ({
  icon,
  label,
  onClick,
  variant = 'primary',
  disabled = false,
  loading = false,
  active = false,
  badge,
  className,
  style
}) => {
  const [ripples, setRipples] = useState([]);
  const [isHovered, setIsHovered] = useState(false);
  const [isPressed, setIsPressed] = useState(false);

  // Очистка старых ripple-эффектов
  useEffect(() => {
    const timeouts = ripples.map(ripple => ripple.timeoutId);
    return () => timeouts.forEach(clearTimeout);
  }, [ripples]);

  const addRipple = useCallback((event) => {
    if (disabled || loading) return;

    const button = event.currentTarget;
    const rect = button.getBoundingClientRect();
    
    const diameter = Math.max(button.clientWidth, button.clientHeight);
    const radius = diameter / 2;

    const ripple = {
      x: event.clientX - rect.left - radius,
      y: event.clientY - rect.top - radius,
      diameter,
      id: Date.now(),
      timeoutId: setTimeout(() => {
        setRipples(prev => prev.filter(r => r.id !== ripple.id));
      }, 1000)
    };

    setRipples(prev => [...prev, ripple]);
  }, [disabled, loading]);

  const variantStyles = {
    primary: {
      backgroundColor: active ? 'var(--primary-dark)' : 'var(--primary)',
      color: 'white',
      hoverBg: 'var(--primary-dark)',
      rippleColor: 'rgba(255, 255, 255, 0.3)'
    },
    secondary: {
      backgroundColor: active ? 'var(--background-dark)' : 'var(--background)',
      color: 'var(--text)',
      hoverBg: 'var(--background-dark)',
      rippleColor: 'rgba(0, 0, 0, 0.1)'
    },
    ghost: {
      backgroundColor: active ? 'var(--background)' : 'transparent',
      color: 'var(--text)',
      hoverBg: 'var(--background)',
      rippleColor: 'rgba(0, 0, 0, 0.1)'
    }
  };

  const currentVariant = variantStyles[variant] || variantStyles.primary;

  return (
    <button
      onClick={(e) => {
        addRipple(e);
        if (onClick && !disabled && !loading) {
          onClick(e);
        }
      }}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => {
        setIsHovered(false);
        setIsPressed(false);
      }}
      onMouseDown={() => setIsPressed(true)}
      onMouseUp={() => setIsPressed(false)}
      disabled={disabled || loading}
      className={className}
      style={{
        position: 'relative',
        display: 'inline-flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: '12px',
        gap: '4px',
        minWidth: '64px',
        border: 'none',
        borderRadius: '8px',
        cursor: disabled || loading ? 'not-allowed' : 'pointer',
        overflow: 'hidden',
        transition: 'all 0.2s ease',
        opacity: disabled ? 0.5 : 1,
        transform: isPressed ? 'scale(0.95)' : isHovered ? 'scale(1.05)' : 'scale(1)',
        ...currentVariant,
        backgroundColor: disabled 
          ? 'var(--background-light)'
          : isHovered 
            ? currentVariant.hoverBg 
            : currentVariant.backgroundColor,
        ...style
      }}
    >
      {/* Индикатор загрузки */}
      {loading && (
        <div style={{
          position: 'absolute',
          top: '50%',
          left: '50%',
          transform: 'translate(-50%, -50%)',
          width: '20px',
          height: '20px',
          border: `2px solid ${currentVariant.color}`,
          borderTopColor: 'transparent',
          borderRadius: '50%',
          animation: 'spin 0.8s linear infinite'
        }} />
      )}

      {/* Badge */}
      {badge && (
        <div style={{
          position: 'absolute',
          top: '0',
          right: '0',
          transform: 'translate(25%, -25%)',
          backgroundColor: 'var(--error)',
          color: 'white',
          fontSize: '12px',
          fontWeight: 'bold',
          padding: '2px 6px',
          borderRadius: '10px',
          minWidth: '20px',
          textAlign: 'center',
          boxShadow: '0 2px 4px rgba(0,0,0,0.2)',
          animation: 'bounce 0.5s ease'
        }}>
          {typeof badge === 'boolean' ? '!' : badge}
        </div>
      )}

      {/* Ripple-эффекты */}
      {ripples.map(ripple => (
        <span
          key={ripple.id}
          style={{
            position: 'absolute',
            top: ripple.y,
            left: ripple.x,
            width: ripple.diameter,
            height: ripple.diameter,
            borderRadius: '50%',
            backgroundColor: currentVariant.rippleColor,
            animation: 'ripple 1s linear',
            pointerEvents: 'none'
          }}
        />
      ))}

      {/* Основной контент */}
      <div style={{
        position: 'relative',
        opacity: loading ? 0 : 1,
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        gap: '4px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: '24px',
          height: '24px'
        }}>
          {icon}
        </div>
        {label && (
          <span style={{
            fontSize: '12px',
            fontWeight: 500,
            textAlign: 'center',
            lineHeight: 1.2,
            maxWidth: '80px',
            overflow: 'hidden',
            textOverflow: 'ellipsis',
            whiteSpace: 'nowrap'
          }}>
            {label}
          </span>
        )}
      </div>

      <style>
        {`
          @keyframes ripple {
            from {
              transform: scale(0);
              opacity: 1;
            }
            to {
              transform: scale(2);
              opacity: 0;
            }
          }

          @keyframes spin {
            to {
              transform: translate(-50%, -50%) rotate(360deg);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: translate(25%, -25%) scale(1);
            }
            50% {
              transform: translate(25%, -25%) scale(1.2);
            }
          }
        `}
      </style>
    </button>
  );
};

QuickActionButton.propTypes = {
  icon: PropTypes.node.isRequired,
  label: PropTypes.string,
  onClick: PropTypes.func,
  variant: PropTypes.oneOf(['primary', 'secondary', 'ghost']),
  disabled: PropTypes.bool,
  loading: PropTypes.bool,
  active: PropTypes.bool,
  badge: PropTypes.oneOfType([
    PropTypes.bool,
    PropTypes.number,
    PropTypes.string
  ]),
  className: PropTypes.string,
  style: PropTypes.object
};

export default React.memo(QuickActionButton);
