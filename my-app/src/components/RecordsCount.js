import React from 'react';
import PropTypes from 'prop-types';

const RecordsCount = ({ total, inProgress, completed, hasIssues }) => {
  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Сводка записей</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
        gap: '16px'
      }}>
        <CountCard
          label="Всего"
          value={total}
          color="#2196F3"
        />
        <CountCard
          label="В работе"
          value={inProgress}
          color="#FF9800"
        />
        <CountCard
          label="Завершено"
          value={completed}
          color="#4CAF50"
        />
        <CountCard
          label="Проблемные"
          value={hasIssues}
          color="#f44336"
        />
      </div>
    </div>
  );
};

const CountCard = ({ label, value, color }) => (
  <div style={{
    backgroundColor: '#f5f5f5',
    padding: '16px',
    borderRadius: '4px',
    borderLeft: `4px solid ${color}`
  }}>
    <div style={{ fontSize: '14px', color: '#666' }}>{label}</div>
    <div style={{ 
      fontSize: '24px', 
      fontWeight: 'bold', 
      color: color,
      marginTop: '4px' 
    }}>
      {value}
    </div>
  </div>
);

CountCard.propTypes = {
  label: PropTypes.string.isRequired,
  value: PropTypes.number.isRequired,
  color: PropTypes.string.isRequired
};

RecordsCount.propTypes = {
  total: PropTypes.number.isRequired,
  inProgress: PropTypes.number.isRequired,
  completed: PropTypes.number.isRequired,
  hasIssues: PropTypes.number.isRequired
};

export default RecordsCount;
