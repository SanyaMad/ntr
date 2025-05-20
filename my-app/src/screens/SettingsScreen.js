import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '../components/Header';
import Input from '../components/Input';
import Button from '../components/Button';
import { syncService } from '../services/SyncService';
import { OPERATOR_PASSWORDS, OPERATOR_STORAGE_KEY } from '../constants';

const SettingsScreen = () => {
  const [settings, setSettings] = useState({
    serverUrl: process.env.REACT_APP_API_URL || '',
    syncInterval: 60,
    autoSync: true
  });
  
  const [passwordSettings, setPasswordSettings] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: ''
  });

  const [passwordError, setPasswordError] = useState('');
  const [passwordSuccess, setPasswordSuccess] = useState('');
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState(null);
  const navigate = useNavigate();
  const currentOperator = localStorage.getItem(OPERATOR_STORAGE_KEY);

  useEffect(() => {
    // Загружаем текущие настройки
    const loadSettings = async () => {
      try {
        const currentSettings = await syncService.getSettings();
        setSettings(currentSettings);
      } catch (error) {
        console.error('Ошибка загрузки настроек:', error);
      }
    };
    loadSettings();
  }, []);

  const handleChange = (field) => (event) => {
    const value = field === 'autoSync' ? event.target.checked : event.target.value;
    setSettings(prev => ({
      ...prev,
      [field]: value
    }));
  };

  const handlePasswordChange = (field) => (event) => {
    setPasswordSettings(prev => ({
      ...prev,
      [field]: event.target.value
    }));
    setPasswordError('');
    setPasswordSuccess('');
  };

  const handleTestConnection = async () => {
    setIsTesting(true);
    setTestResult(null);
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 10000); // Таймаут 10 секунд

      const response = await fetch(settings.serverUrl, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Ошибка сервера: ${response.statusText}`);
      }

      setTestResult({ success: true, message: 'Соединение установлено успешно' });
    } catch (error) {
      if (error.name === 'AbortError') {
        setTestResult({ success: false, message: 'Тест соединения: запрос превысил лимит времени.' });
      } else {
        setTestResult({ success: false, message: `Ошибка соединения: ${error.message}` });
      }
    } finally {
      setIsTesting(false);
    }
  };

  const handleSave = async () => {
    try {
      await syncService.updateSettings(settings);
      if (settings.autoSync) {
        await syncService.startSync(settings.syncInterval * 1000);
      } else {
        syncService.stopSync();
      }
      navigate('/admin');
    } catch (error) {
      console.error('Ошибка сохранения настроек:', error);
    }
  };

  const handleSyncNow = async () => {
    try {
      await syncService.synchronize();
      setTestResult({ success: true, message: 'Синхронизация выполнена успешно' });
    } catch (error) {
      setTestResult({ success: false, message: `Ошибка синхронизации: ${error.message}` });
    }
  };

  const handleChangePassword = () => {
    const { currentPassword, newPassword, confirmPassword } = passwordSettings;
    
    if (!currentPassword || !newPassword || !confirmPassword) {
      setPasswordError('Пожалуйста, заполните все поля');
      return;
    }

    if (newPassword !== confirmPassword) {
      setPasswordError('Новые пароли не совпадают');
      return;
    }

    if (newPassword.length < 4) {
      setPasswordError('Новый пароль должен содержать минимум 4 символа');
      return;
    }

    const correctPassword = OPERATOR_PASSWORDS[currentOperator];
    
    if (currentPassword !== correctPassword) {
      setPasswordError('Текущий пароль неверен');
      return;
    }

    // Обновляем пароль в локальном хранилище
    OPERATOR_PASSWORDS[currentOperator] = newPassword;
    localStorage.setItem('OPERATOR_PASSWORDS', JSON.stringify(OPERATOR_PASSWORDS));
    
    setPasswordSuccess('Пароль успешно изменен');
    setPasswordSettings({
      currentPassword: '',
      newPassword: '',
      confirmPassword: ''
    });
  };

  return (
    <div style={{ padding: '16px' }}>
      <Header title="Настройки" showSettings={false} />
      
      <div style={{ 
        maxWidth: '600px',
        margin: '0 auto',
        backgroundColor: '#fff',
        padding: '24px',
        borderRadius: '8px',
        boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
      }}>
        <h2 style={{ marginBottom: '24px', color: '#333' }}>Настройки синхронизации</h2>
        
        {/* Существующие настройки синхронизации */}
        <div style={{ marginBottom: '24px' }}>
          <Input
            label="URL сервера"
            value={settings.serverUrl}
            onChange={handleChange('serverUrl')}
            placeholder="https://your-server.com/api"
            style={{ marginBottom: '16px' }}
          />
          
          <div style={{ display: 'flex', gap: '8px', marginBottom: '16px' }}>
            <Button
              onClick={handleTestConnection}
              disabled={isTesting || !settings.serverUrl}
              loading={isTesting}
              variant="primary"
            >
              {isTesting ? 'Проверка...' : 'Проверить соединение'}
            </Button>
            
            <Button
              onClick={handleSyncNow}
              disabled={isTesting || !settings.serverUrl}
              variant="success"
            >
              Синхронизировать сейчас
            </Button>
          </div>

          {testResult && (
            <div style={{
              padding: '12px',
              borderRadius: '4px',
              backgroundColor: testResult.success ? '#E8F5E9' : '#FFEBEE',
              color: testResult.success ? '#2E7D32' : '#C62828',
              marginBottom: '16px'
            }}>
              {testResult.message}
            </div>
          )}
        </div>

        <div style={{ marginBottom: '24px' }}>
          <Input
            type="number"
            label="Интервал синхронизации (секунды)"
            value={settings.syncInterval}
            onChange={handleChange('syncInterval')}
            min={30}
            style={{ marginBottom: '16px' }}
          />
          
          <label style={{
            display: 'flex',
            alignItems: 'center',
            gap: '8px',
            cursor: 'pointer'
          }}>
            <input
              type="checkbox"
              checked={settings.autoSync}
              onChange={handleChange('autoSync')}
            />
            Автоматическая синхронизация
          </label>
        </div>

        <h2 style={{ marginBottom: '24px', color: '#333', marginTop: '32px' }}>Изменение пароля</h2>
        
        <div style={{ marginBottom: '24px' }}>
          {passwordError && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#ffebee',
              color: '#c62828',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {passwordError}
            </div>
          )}

          {passwordSuccess && (
            <div style={{
              padding: '12px',
              marginBottom: '16px',
              backgroundColor: '#e8f5e9',
              color: '#2e7d32',
              borderRadius: '4px',
              fontSize: '14px'
            }}>
              {passwordSuccess}
            </div>
          )}

          <Input
            type="password"
            label="Текущий пароль"
            value={passwordSettings.currentPassword}
            onChange={handlePasswordChange('currentPassword')}
            style={{ marginBottom: '16px' }}
          />

          <Input
            type="password"
            label="Новый пароль"
            value={passwordSettings.newPassword}
            onChange={handlePasswordChange('newPassword')}
            style={{ marginBottom: '16px' }}
          />

          <Input
            type="password"
            label="Подтвердите новый пароль"
            value={passwordSettings.confirmPassword}
            onChange={handlePasswordChange('confirmPassword')}
            style={{ marginBottom: '16px' }}
          />

          <Button
            onClick={handleChangePassword}
            style={{
              backgroundColor: '#2196F3',
              color: 'white',
              marginBottom: '24px'
            }}
          >
            Изменить пароль
          </Button>
        </div>

        <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '8px' }}>
          <Button
            onClick={() => navigate('/admin')}
            variant="secondary"
          >
            Отмена
          </Button>
          
          <Button
            onClick={handleSave}
            variant="primary"
          >
            Сохранить настройки
          </Button>
        </div>
      </div>
    </div>
  );
};

export default SettingsScreen;
