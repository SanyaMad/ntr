import React, { useState, useCallback } from 'react';
import PropTypes from 'prop-types';
import Button from './Button';

const STATUS_CONFIG = {
  completed: {
    color: '#52c41a',
    backgroundColor: '#f6ffed',
    borderColor: '#b7eb8f',
    label: 'Завершено',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <path d="M20 6L9 17l-5-5"/>
      </svg>
    )
  },
  in_progress: {
    color: '#1890ff',
    backgroundColor: '#e6f7ff',
    borderColor: '#91d5ff',
    label: 'В работе',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <path d="M12 6v6l4 2"/>
      </svg>
    )
  },
  error: {
    color: '#f5222d',
    backgroundColor: '#fff1f0',
    borderColor: '#ffa39e',
    label: 'Ошибка',
    icon: (
      <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="12" cy="12" r="10"/>
        <line x1="15" y1="9" x2="9" y2="15"/>
        <line x1="9" y1="9" x2="15" y2="15"/>
      </svg>
    )
  }
};

const RecordCard = ({
  record,
  onEdit,
  onDelete,
  onClick,
  className,
  style,
  detailed = false
}) => {
  const [isHovered, setIsHovered] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const statusConfig = STATUS_CONFIG[record.status] || STATUS_CONFIG.in_progress;

  const formatDate = useCallback((date) => {
    if (!date) return '';
    try {
      const dateObj = new Date(date);
      if (isNaN(dateObj.getTime())) return '';
      const now = new Date();
      const diffInHours = (now - dateObj) / (1000 * 60 * 60);

      if (diffInHours < 24) {
        if (diffInHours < 1) {
          const minutes = Math.floor(diffInHours * 60);
          return `${minutes} ${minutes === 1 ? 'минуту' : 'минут'} назад`;
        }
        const hours = Math.floor(diffInHours);
        return `${hours} ${hours === 1 ? 'час' : 'часов'} назад`;
      }

      return dateObj.toLocaleString('ru-RU', {
        day: '2-digit',
        month: 'short',
        year: 'numeric',
        hour: '2-digit',
        minute: '2-digit'
      });
    } catch {
      return '';
    }
  }, []);

  const formatDuration = useCallback((duration) => {
    if (!duration) return '0 сек';
    
    const hours = Math.floor(duration / 3600);
    const minutes = Math.floor((duration % 3600) / 60);
    const seconds = duration % 60;
    
    const parts = [];
    if (hours > 0) {
      parts.push(`${hours} ${hours === 1 ? 'час' : 'часов'}`);
    }
    if (minutes > 0) {
      parts.push(`${minutes} ${minutes === 1 ? 'минута' : 'минут'}`);
    }
    if (seconds > 0 || parts.length === 0) {
      parts.push(`${seconds} ${seconds === 1 ? 'секунда' : 'секунд'}`);
    }
    
    return parts.join(' ');
  }, []);

  const handleDelete = async (e) => {
    e.stopPropagation();
    
    if (window.confirm('Вы уверены, что хотите удалить эту запись?')) {
      setIsDeleting(true);
      try {
        await onDelete(record.id);
      } catch (error) {
        console.error('Ошибка при удалении:', error);
        alert('Не удалось удалить запись. Пожалуйста, попробуйте снова.');
      } finally {
        setIsDeleting(false);
      }
    }
  };

  return (
    <div
      onClick={onClick}
      onMouseEnter={() => setIsHovered(true)}
      onMouseLeave={() => setIsHovered(false)}
      className={className}
      style={{
        position: 'relative',
        backgroundColor: 'white',
        borderRadius: '12px',
        padding: '20px',
        boxShadow: isHovered ? '0 8px 24px rgba(0,0,0,0.12)' : '0 2px 8px rgba(0,0,0,0.06)',
        cursor: onClick ? 'pointer' : 'default',
        transition: 'all 0.3s ease',
        transform: isHovered ? 'translateY(-2px)' : 'none',
        border: `1px solid ${isHovered ? statusConfig.borderColor : 'transparent'}`,
        ...style
      }}
    >
      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: '16px'
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <h3 style={{
            margin: 0,
            fontSize: '18px',
            color: 'var(--text-primary)',
            fontWeight: 600
          }}>
            Блок #{record.blockNumber}
          </h3>
          <div style={{
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            borderRadius: '16px',
            fontSize: '13px',
            fontWeight: 500,
            color: statusConfig.color,
            backgroundColor: statusConfig.backgroundColor,
            border: `1px solid ${statusConfig.borderColor}`,
            transition: 'all 0.2s ease'
          }}>
            {statusConfig.icon}
            {statusConfig.label}
          </div>
        </div>

        {(onEdit || onDelete) && (
          <div style={{
            display: 'flex',
            gap: '8px',
            opacity: isHovered ? 1 : 0,
            transform: isHovered ? 'translateX(0)' : 'translateX(10px)',
            transition: 'all 0.2s ease'
          }}>
            {onEdit && (
              <Button
                title="Изменить"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(record);
                }}
                variant="secondary"
                size="small"
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/>
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/>
                  </svg>
                }
              />
            )}
            {onDelete && (
              <Button
                title="Удалить"
                onClick={handleDelete}
                variant="danger"
                size="small"
                loading={isDeleting}
                icon={
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M3 6h18"/>
                    <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6"/>
                    <path d="M8 6V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"/>
                  </svg>
                }
              />
            )}
          </div>
        )}
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: detailed ? 'repeat(auto-fit, minmax(200px, 1fr))' : '1fr',
        gap: '16px',
        marginBottom: '16px'
      }}>
        <div>
          <div style={{
            color: 'var(--text-secondary)',
            fontSize: '13px',
            marginBottom: '4px',
            fontWeight: 500
          }}>
            Оператор
          </div>
          <div style={{ fontSize: '15px' }}>{record.operatorName}</div>
        </div>

        {detailed && (
          <>
            <div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                marginBottom: '4px',
                fontWeight: 500
              }}>
                Версия модели
              </div>
              <div style={{ fontSize: '15px' }}>{record.modelVersion}</div>
            </div>
            <div>
              <div style={{
                color: 'var(--text-secondary)',
                fontSize: '13px',
                marginBottom: '4px',
                fontWeight: 500
              }}>
                Время выполнения
              </div>
              <div style={{ fontSize: '15px' }}>{formatDuration(record.duration)}</div>
            </div>
          </>
        )}
      </div>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center'
      }}>
        <div style={{
          color: 'var(--text-secondary)',
          fontSize: '13px',
          display: 'flex',
          alignItems: 'center',
          gap: '6px'
        }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10"/>
            <polyline points="12 6 12 12 16 14"/>
          </svg>
          {formatDate(record.timestamp)}
        </div>

        {record.notes && (
          <div style={{
            fontSize: '13px',
            color: 'var(--text-secondary)',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            padding: '4px 12px',
            backgroundColor: 'var(--background)',
            borderRadius: '16px'
          }}>
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
              <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z"/>
            </svg>
            Есть примечание
          </div>
        )}
      </div>

      {/* Индикатор загрузки при удалении */}
      {isDeleting && (
        <div style={{
          position: 'absolute',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          backgroundColor: 'rgba(255, 255, 255, 0.8)',
          borderRadius: '12px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          animation: 'fadeIn 0.2s ease'
        }}>
          <div style={{
            width: '24px',
            height: '24px',
            border: '2px solid var(--primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite'
          }} />
        </div>
      )}

      <style>
        {`
          @keyframes fadeIn {
            from { opacity: 0; }
            to { opacity: 1; }
          }

          @keyframes spin {
            to { transform: rotate(360deg); }
          }
        `}
      </style>
    </div>
  );
};

RecordCard.propTypes = {
  record: PropTypes.shape({
    id: PropTypes.string.isRequired,
    blockNumber: PropTypes.oneOfType([PropTypes.string, PropTypes.number]).isRequired,
    operatorName: PropTypes.string.isRequired,
    modelVersion: PropTypes.string,
    status: PropTypes.oneOf(['completed', 'in_progress', 'error']).isRequired,
    timestamp: PropTypes.string.isRequired,
    duration: PropTypes.number,
    notes: PropTypes.string
  }).isRequired,
  onEdit: PropTypes.func,
  onDelete: PropTypes.func,
  onClick: PropTypes.func,
  className: PropTypes.string,
  style: PropTypes.object,
  detailed: PropTypes.bool
};

export default React.memo(RecordCard);