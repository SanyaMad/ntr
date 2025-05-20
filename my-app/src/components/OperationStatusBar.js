import React, { useState, useEffect, useCallback } from 'react';
import PropTypes from 'prop-types';
import OperationMiniStatus from './OperationMiniStatus';

const STATUS_COLORS = {
  completed: {
    primary: '#52c41a',
    secondary: '#f6ffed',
    accent: '#b7eb8f'
  },
  in_progress: {
    primary: '#1890ff',
    secondary: '#e6f7ff',
    accent: '#91d5ff'
  },
  error: {
    primary: '#f5222d',
    secondary: '#fff1f0',
    accent: '#ffa39e'
  },
  warning: {
    primary: '#faad14',
    secondary: '#fffbe6',
    accent: '#ffe58f'
  }
};

const OperationStatusBar = ({
  status,
  progress = 0,
  total = 100,
  showPercentage = true,
  showNumbers = true,
  height = 8,
  animated = true,
  className,
  style,
  onClick
}) => {
  const [animatedProgress, setAnimatedProgress] = useState(0);
  const [isHovered, setIsHovered] = useState(false);

  const colors = STATUS_COLORS[status] || STATUS_COLORS.in_progress;
  const percentage = Math.round((progress / total) * 100);

  // Плавная анимация прогресса
  useEffect(() => {
    if (!animated) {
      setAnimatedProgress(percentage);
      return;
    }

    let start = null;
    const startValue = animatedProgress;
    const endValue = percentage;
    const duration = 500;

    const animate = (timestamp) => {
      if (!start) start = timestamp;
      const elapsed = timestamp - start;
      const progress = Math.min(elapsed / duration, 1);

      // Функция плавности (easing)
      const easeOut = (t) => 1 - Math.pow(1 - t, 3);
      
      const currentProgress = startValue + (endValue - startValue) * easeOut(progress);
      setAnimatedProgress(currentProgress);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    requestAnimationFrame(animate);
  }, [percentage, animated, animatedProgress]);

  const formatValue = useCallback((value) => {
    if (value >= 1000000) {
      return `${(value / 1000000).toFixed(1)}M`;
    }
    if (value >= 1000) {
      return `${(value / 1000).toFixed(1)}K`;
    }
    return value.toString();
  }, []);

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        position: 'relative',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'transform 0.2s ease',
        transform: isHovered ? 'translateY(-1px)' : 'none',
        ...style
      }}
    >
      {/* Основной контейнер прогресс-бара */}
      <div style={{
        position: 'relative',
        height: `${height}px`,
        backgroundColor: colors.secondary,
        borderRadius: `${height / 2}px`,
        overflow: 'hidden',
        boxShadow: isHovered ? `0 2px 8px ${colors.accent}40` : 'none',
        transition: 'all 0.2s ease'
      }}>
        {/* Фоновая анимация для in_progress */}
        {status === 'in_progress' && (
          <div style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundImage: `linear-gradient(
              45deg,
              ${colors.accent}20 25%,
              transparent 25%,
              transparent 50%,
              ${colors.accent}20 50%,
              ${colors.accent}20 75%,
              transparent 75%
            )`,
            backgroundSize: '40px 40px',
            animation: 'progressStripes 1s linear infinite'
          }} />
        )}

        {/* Индикатор прогресса */}
        <div style={{
          height: '100%',
          width: `${animatedProgress}%`,
          backgroundColor: colors.primary,
          borderRadius: `${height / 2}px`,
          transition: animated ? 'none' : 'width 0.3s ease'
        }} />

        {/* Блики */}
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          height: '50%',
          background: 'linear-gradient(180deg, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 100%)'
        }} />
      </div>

      {/* Информация о прогрессе */}
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginTop: '8px',
        gap: '12px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}>
          <OperationMiniStatus 
            status={status}
            size="small"
            showLabel={false}
          />
          {showNumbers && (
            <span style={{
              fontSize: '14px',
              color: 'var(--text)',
              fontVariantNumeric: 'tabular-nums'
            }}>
              {formatValue(progress)} / {formatValue(total)}
            </span>
          )}
        </div>

        {showPercentage && (
          <div style={{
            fontSize: '14px',
            fontWeight: 500,
            color: colors.primary,
            minWidth: '48px',
            textAlign: 'right',
            fontVariantNumeric: 'tabular-nums'
          }}>
            {Math.round(animatedProgress)}%
          </div>
        )}
      </div>

      <style>
        {`
          @keyframes progressStripes {
            from {
              background-position: 40px 0;
            }
            to {
              background-position: 0 0;
            }
          }
        `}
      </style>
    </div>
  );
};

OperationStatusBar.propTypes = {
  status: PropTypes.oneOf(['completed', 'in_progress', 'error', 'warning']).isRequired,
  progress: PropTypes.number,
  total: PropTypes.number,
  showPercentage: PropTypes.bool,
  showNumbers: PropTypes.bool,
  height: PropTypes.number,
  animated: PropTypes.bool,
  className: PropTypes.string,
  style: PropTypes.object,
  onClick: PropTypes.func
};

export default React.memo(OperationStatusBar);
