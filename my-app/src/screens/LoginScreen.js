import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { OPERATORS, OPERATOR_STORAGE_KEY, OPERATOR_PASSWORDS } from '../constants';
import Select from '../components/Select';
import Button from '../components/Button';
import Input from '../components/Input';

const LoginScreen = () => {
  const [selectedOperator, setSelectedOperator] = useState(null);
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Проверяем, не авторизован ли уже пользователь
  useEffect(() => {
    const currentOperator = localStorage.getItem(OPERATOR_STORAGE_KEY);
    if (currentOperator) {
      navigate('/', { replace: true });
    }
  }, [navigate]);

  const handleLogin = async () => {
    if (!selectedOperator) {
      setError('Пожалуйста, выберите оператора');
      return;
    }

    if (!password) {
      setError('Пожалуйста, введите пароль');
      return;
    }

    setIsLoading(true);
    setError('');

    try {
      const correctPassword = OPERATOR_PASSWORDS[selectedOperator.value];
      
      if (password !== correctPassword) {
        throw new Error('Неверный пароль');
      }
      
      localStorage.setItem(OPERATOR_STORAGE_KEY, selectedOperator.value);
      
      // Перенаправляем на предыдущую страницу или на главную
      const from = location.state?.from?.pathname || '/';
      navigate(from, { replace: true });
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  };

  const operatorOptions = OPERATORS.map(operator => ({
    value: operator,
    label: operator
  }));

  const handleKeyPress = (e) => {
    if (e.key === 'Enter' && !isLoading) {
      handleLogin();
    }
  };

  return (
    <div
      style={{
        maxWidth: '400px',
        margin: '50px auto',
        padding: '20px',
        border: '1px solid #ccc',
        borderRadius: '8px',
        boxShadow: '0 4px 8px rgba(0, 0, 0, 0.1)',
        backgroundColor: '#fff',
      }}
    >
      <h1 style={{ textAlign: 'center', marginBottom: '24px', color: '#333' }}>
        Вход в систему
      </h1>

      {error && (
        <div style={{
          padding: '12px',
          marginBottom: '16px',
          backgroundColor: '#ffebee',
          color: '#c62828',
          borderRadius: '4px',
          fontSize: '14px'
        }}>
          {error}
        </div>
      )}

      <Select
        label="Оператор"
        value={selectedOperator}
        onChange={setSelectedOperator}
        options={operatorOptions}
        placeholder="Выберите оператора"
        required
        error={error && !selectedOperator ? 'Выберите оператора' : ''}
      />

      <Input
        label="Пароль"
        type="password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        placeholder="Введите пароль"
        onKeyPress={handleKeyPress}
        required
        error={error && !password ? 'Введите пароль' : ''}
        style={{ marginTop: '16px' }}
      />

      <Button
        onClick={handleLogin}
        disabled={!selectedOperator || !password || isLoading}
        loading={isLoading}
        variant="primary"
        fullWidth
        style={{ marginTop: '16px' }}
      >
        {isLoading ? 'Вход...' : 'Войти'}
      </Button>
    </div>
  );
};

export default LoginScreen;
