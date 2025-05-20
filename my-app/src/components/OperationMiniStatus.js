import React, { useMemo } from 'react';
import PropTypes from 'prop-types';

const STATUS_CONFIG = {
  completed: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#52c41a" strokeWidth="2">
        <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/>
        <polyline points="22 4 12 14.01 9 11.01"/>
      </svg>
    ),
    color: '#52c41a',
    bgColor: '#f6ffed',
    border: '#b7eb8f',
    label: 'Завершено'
  },
  in_progress: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#1890ff" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <polyline points="12 6 12 12 16 14"/>
      </svg>
    ),
    color: '#1890ff',
    bgColor: '#e6f7ff',
    border: '#91d5ff',
    label: 'В процессе',
    animation: 'spin 2s linear infinite'
  },
  error: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#f5222d" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    ),
    color: '#f5222d',
    bgColor: '#fff1f0',
    border: '#ffa39e',
    label: 'Ошибка'
  },
  warning: {
    icon: (
      <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#faad14" strokeWidth="2">
        <path d="M10.29 3.86L1.82 18a2 2 0 0 0 1.71 3h16.94a2 2 0 0 0 1.71-3L13.71 3.86a2 2 0 0 0-3.42 0z"/>
        <line x1="12" y1="9" x2="12" y2="13"/>
        <line x1="12" y1="17" x2="12.01" y2="17"/>
      </svg>
    ),
    color: '#faad14',
    bgColor: '#fffbe6',
    border: '#ffe58f',
    label: 'Предупреждение'
  }
};

const OperationMiniStatus = ({
  status = 'in_progress', // значение по умолчанию
  label,
  showLabel = true,
  size = 'medium',
  onClick,
  className,
  style
}) => {
  const config = useMemo(() => STATUS_CONFIG[status] || STATUS_CONFIG.in_progress, [status]);
  
  const sizeConfig = useMemo(() => {
    switch (size) {
      case 'small':
        return {
          padding: '4px 8px',
          fontSize: '12px',
          iconSize: 16
        };
      case 'large':
        return {
          padding: '8px 16px',
          fontSize: '16px',
          iconSize: 24
        };
      default:
        return {
          padding: '6px 12px',
          fontSize: '14px',
          iconSize: 20
        };
    }
  }, [size]);

  return (
    <div
      onClick={onClick}
      className={className}
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        gap: '8px',
        padding: sizeConfig.padding,
        backgroundColor: config.bgColor,
        border: `1px solid ${config.border}`,
        borderRadius: '16px',
        color: config.color,
        fontSize: sizeConfig.fontSize,
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.2s ease',
        userSelect: 'none',
        ':hover': onClick ? {
          backgroundColor: `${config.bgColor}dd`,
          transform: 'translateY(-1px)'
        } : {},
        ':active': onClick ? {
          transform: 'translateY(0)'
        } : {},
        ...style
      }}
    >
      <div style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        animation: config.animation,
        transform: `scale(${sizeConfig.iconSize / 20})`
      }}>
        {config.icon}
      </div>
      
      {showLabel && (
        <span style={{
          fontWeight: 500
        }}>
          {label || config.label}
        </span>
      )}

      <style>
        {`
          @keyframes spin {
            to {
              transform: rotate(360deg) scale(${sizeConfig.iconSize / 20});
            }
          }
        `}
      </style>
    </div>
  );
};

OperationMiniStatus.propTypes = {
  status: PropTypes.oneOf(['completed', 'in_progress', 'error', 'warning']).isRequired,
  label: PropTypes.string,
  showLabel: PropTypes.bool,
  size: PropTypes.oneOf(['small', 'medium', 'large']),
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object
};

export default React.memo(OperationMiniStatus);
