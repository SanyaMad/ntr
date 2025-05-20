import React from 'react';
import PropTypes from 'prop-types';
import { useNavigate } from 'react-router-dom';
import QuickActionButton from './QuickActionButton';

// Цветовая схема приложения
const COLORS = {
  success: '#4CAF50',
  primary: '#2196F3',
  warning: '#FF9800',
  info: '#03A9F4',
  secondary: '#9C27B0'
};

const WelcomeSection = ({ operatorName }) => {
  const navigate = useNavigate();
  const isAdmin = ['Меньшеков А.В.', 'Андреев Н.Н.'].includes(operatorName);

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '24px',
      marginBottom: '24px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <div style={{ marginBottom: '24px' }}>
        <h2 style={{ margin: '0 0 8px 0' }}>
          Добро пожаловать, {operatorName || 'Пользователь'}!
        </h2>
        <p style={{ margin: 0, color: '#666' }}>
          Выберите действие для начала работы
        </p>
      </div>

      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <QuickActionButton
          icon="📝"
          label="Создать запись"
          onClick={() => navigate('/new-record')}
          color={COLORS.success}
        />
        <QuickActionButton
          icon="📋"
          label="История"
          onClick={() => navigate('/history')}
          color={COLORS.warning}
        />
        <QuickActionButton
          icon="📊"
          label="Статистика"
          onClick={() => navigate('/admin')}
          color={COLORS.primary}
        />
        <QuickActionButton
          icon="⚙️"
          label="Настройки"
          onClick={() => navigate('/settings')}
          color={COLORS.secondary}
        />
      </div>

      {isAdmin && (
        <div style={{
          marginTop: '24px',
          padding: '16px',
          backgroundColor: '#e3f2fd',
          borderRadius: '4px',
          display: 'flex',
          alignItems: 'center',
          gap: '12px'
        }}>
          <span style={{ fontSize: '24px' }}>ℹ️</span>
          <div>
            <div style={{ fontWeight: 'bold', marginBottom: '4px' }}>
              Режим администратора
            </div>
            <div style={{ fontSize: '14px', color: '#666' }}>
              У вас есть доступ к расширенным функциям управления и статистике
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

WelcomeSection.propTypes = {
  operatorName: PropTypes.string.isRequired
};

export default WelcomeSection;
