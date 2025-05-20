import React from 'react';
import PropTypes from 'prop-types';

const MetricCard = ({ title, value, trend, isLoading, error }) => {
  const getTrendColor = () => {
    if (!trend) return '#666';
    return trend > 0 ? '#4CAF50' : '#f44336';
  };

  const getTrendIcon = () => {
    if (!trend) return null;
    return trend > 0 ? '↑' : '↓';
  };

  if (isLoading) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        animation: 'pulse 1.5s infinite'
      }}>
        <div style={{
          height: '20px',
          width: '60%',
          backgroundColor: '#f0f0f0',
          marginBottom: '12px',
          borderRadius: '4px'
        }} />
        <div style={{
          height: '32px',
          width: '80%',
          backgroundColor: '#f0f0f0',
          borderRadius: '4px'
        }} />
      </div>
    );
  }

  if (error) {
    return (
      <div style={{
        padding: '20px',
        backgroundColor: '#fff2f0',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
        border: '1px solid #ffccc7'
      }}>
        <div style={{ color: '#cf1322', fontSize: '14px' }}>
          Ошибка загрузки данных
        </div>
      </div>
    );
  }

  return (
    <div style={{
      padding: '20px',
      backgroundColor: '#fff',
      borderRadius: '8px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
      transition: 'transform 0.2s ease',
      cursor: 'pointer',
      ':hover': {
        transform: 'translateY(-2px)'
      }
    }}>
      <div style={{ 
        color: '#666',
        fontSize: '14px',
        marginBottom: '8px'
      }}>
        {title}
      </div>
      <div style={{
        display: 'flex',
        alignItems: 'baseline',
        gap: '8px'
      }}>
        <div style={{
          fontSize: '24px',
          fontWeight: 'bold',
          color: '#333'
        }}>
          {value}
        </div>
        {trend !== null && (
          <div style={{
            fontSize: '14px',
            color: getTrendColor(),
            display: 'flex',
            alignItems: 'center',
            gap: '2px'
          }}>
            {getTrendIcon()}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
    </div>
  );
};

MetricCard.propTypes = {
  title: PropTypes.string.isRequired,
  value: PropTypes.oneOfType([
    PropTypes.string,
    PropTypes.number
  ]),
  trend: PropTypes.number,
  isLoading: PropTypes.bool,
  error: PropTypes.string
};

const KPIMetrics = ({ stats, calculateMetrics }) => {
  // Если есть stats, используем их, иначе считаем метрики из calculateMetrics
  const metrics = React.useMemo(() => {
    if (stats) {
      // Приводим к нужному виду
      return {
        totalRecords: stats.totalBlocks ?? 0,
        successRate: stats.total ? (stats.successful / stats.total) * 100 : 0,
        averageOperations: stats.totalBlocks ? (stats.total / stats.totalBlocks) : 0,
        errorRate: stats.total ? (stats.failed / stats.total) * 100 : 0
      };
    }
    if (typeof calculateMetrics === 'function') {
      return calculateMetrics([]);
    }
    return {};
  }, [stats, calculateMetrics]);

  const formatValue = (value, type) => {
    if (typeof value !== 'number') return '-';

    switch (type) {
      case 'percentage':
        return `${value.toFixed(1)}%`;
      case 'time':
        return value < 60 
          ? `${value}м`
          : `${Math.floor(value / 60)}ч ${value % 60}м`;
      case 'number':
        return value.toLocaleString();
      default:
        return value;
    }
  };

  const metricsConfig = [
    {
      key: 'completionRate',
      title: 'Процент выполнения',
      type: 'percentage'
    },
    {
      key: 'avgProcessingTime',
      title: 'Среднее время обработки',
      type: 'time'
    },
    {
      key: 'totalBlocks',
      title: 'Всего блоков',
      type: 'number'
    },
    {
      key: 'errorRate',
      title: 'Процент ошибок',
      type: 'percentage'
    }
  ];

  return (
    <div style={{
      display: 'grid',
      gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))',
      gap: '20px',
      margin: '20px 0'
    }}>
      {metricsConfig.map(({ key, title, type }) => (
        <MetricCard
          key={key}
          title={title}
          value={formatValue(metrics[key], type)}
          trend={metrics[`${key}Trend`]}
          isLoading={false}
          error={null}
        />
      ))}
    </div>
  );
};

KPIMetrics.propTypes = {
  stats: PropTypes.object,
  calculateMetrics: PropTypes.func
};

export default React.memo(KPIMetrics);