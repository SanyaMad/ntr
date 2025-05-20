import React, { useEffect, useCallback, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const IDLE_TIMEOUT = 30 * 60 * 1000; // 30 минут
const WARNING_TIMEOUT = 29 * 60 * 1000; // 29 минут
const CHECK_INTERVAL = 1000; // 1 секунда

const IdleTimeTracker = ({ operations = [], timeRange }) => {
  const navigate = useNavigate();
  const lastActivityTime = useRef(Date.now());
  const warningShownRef = useRef(false);
  const timeoutIdRef = useRef(null);

  const resetTimer = useCallback(() => {
    lastActivityTime.current = Date.now();
    warningShownRef.current = false;
  }, []);

  const showWarning = useCallback(() => {
    if (!warningShownRef.current) {
      warningShownRef.current = true;
      const timeLeft = Math.round((IDLE_TIMEOUT - WARNING_TIMEOUT) / 1000);
      
      // Используем нативный confirm для предупреждения
      const shouldStayLoggedIn = window.confirm(
        `Вы неактивны уже ${Math.floor(WARNING_TIMEOUT / 60000)} минут. \n` +
        `Сессия будет завершена через ${timeLeft} секунд. \n\n` +
        'Нажмите OK, чтобы остаться в системе.'
      );

      if (shouldStayLoggedIn) {
        resetTimer();
      }
    }
  }, [resetTimer]);

  const handleLogout = useCallback(() => {
    localStorage.removeItem('currentOperator');
    navigate('/login');
  }, [navigate]);

  const checkIdleTime = useCallback(() => {
    const currentTime = Date.now();
    const idleTime = currentTime - lastActivityTime.current;

    if (idleTime >= IDLE_TIMEOUT) {
      handleLogout();
    } else if (idleTime >= WARNING_TIMEOUT && !warningShownRef.current) {
      showWarning();
    }
  }, [handleLogout, showWarning]);

  useEffect(() => {
    const events = [
      'mousemove',
      'mousedown',
      'keypress',
      'scroll',
      'touchstart',
      'click'
    ];

    const handleUserActivity = () => {
      resetTimer();
    };

    // Устанавливаем слушатели событий
    events.forEach(event => {
      window.addEventListener(event, handleUserActivity, { passive: true });
    });

    // Запускаем интервал проверки
    timeoutIdRef.current = setInterval(checkIdleTime, CHECK_INTERVAL);

    // Очистка при размонтировании
    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleUserActivity);
      });
      
      if (timeoutIdRef.current) {
        clearInterval(timeoutIdRef.current);
      }
    };
  }, [resetTimer, checkIdleTime]);

  const calculateIdleTime = () => {
    // Проверяем, что operations это массив и он не пустой
    if (!Array.isArray(operations) || operations.length === 0) return 0;
    
    // Проверяем, что у всех операций есть timestamp
    const validOperations = operations.filter(op => op && op.timestamp);
    if (validOperations.length === 0) return 0;
    
    // Сортируем операции по времени
    const sortedOps = [...validOperations].sort((a, b) => 
      new Date(a.timestamp) - new Date(b.timestamp)
    );

    let totalIdleTime = 0;
    let lastOpTime = new Date(sortedOps[0].timestamp);

    // Вычисляем время простоя между операциями
    for (let i = 1; i < sortedOps.length; i++) {
      const currentOpTime = new Date(sortedOps[i].timestamp);
      const timeDiff = currentOpTime - lastOpTime;
      
      // Считаем простоем перерыв более 30 минут между операциями
      if (timeDiff > 30 * 60 * 1000) {
        totalIdleTime += timeDiff;
      }
      
      lastOpTime = currentOpTime;
    }

    return totalIdleTime;
  };

  const calculateEfficiency = () => {
    if (!Array.isArray(operations) || operations.length === 0 || !timeRange) return 0;
    
    const totalTime = timeRange.end - timeRange.start;
    if (totalTime <= 0) return 0;
    
    const idleTime = calculateIdleTime();
    const workTime = totalTime - idleTime;
    
    return (workTime / totalTime) * 100;
  };

  const formatDuration = (ms) => {
    const hours = Math.floor(ms / (1000 * 60 * 60));
    const minutes = Math.floor((ms % (1000 * 60 * 60)) / (1000 * 60));
    return `${hours}ч ${minutes}м`;
  };

  const idleTime = calculateIdleTime();
  const efficiency = calculateEfficiency();

  return (
    <div style={{
      backgroundColor: '#fff',
      borderRadius: '8px',
      padding: '16px',
      boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
    }}>
      <h3 style={{ marginTop: 0, marginBottom: '16px' }}>Эффективность работы</h3>
      
      <div style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
        gap: '16px'
      }}>
        <div style={{
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          borderLeft: '4px solid #FF9800'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Время простоя</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#FF9800' }}>
            {formatDuration(idleTime)}
          </div>
        </div>

        <div style={{
          padding: '16px',
          backgroundColor: '#f5f5f5',
          borderRadius: '4px',
          borderLeft: '4px solid #4CAF50'
        }}>
          <div style={{ fontSize: '14px', color: '#666' }}>Эффективность</div>
          <div style={{ fontSize: '24px', fontWeight: 'bold', color: '#4CAF50' }}>
            {efficiency.toFixed(1)}%
          </div>
        </div>
      </div>

      {idleTime > (4 * 60 * 60 * 1000) && ( // Предупреждение при простое более 4 часов
        <div style={{
          marginTop: '16px',
          padding: '12px',
          backgroundColor: '#fff3e0',
          borderRadius: '4px',
          color: '#e65100',
          fontSize: '14px'
        }}>
          ⚠️ Обнаружен длительный простой. Рекомендуется проверить причины задержек.
        </div>
      )}
    </div>
  );
};

IdleTimeTracker.propTypes = {
  operations: PropTypes.arrayOf(PropTypes.shape({
    timestamp: PropTypes.string.isRequired
  })),
  timeRange: PropTypes.shape({
    start: PropTypes.instanceOf(Date).isRequired,
    end: PropTypes.instanceOf(Date).isRequired
  }).isRequired
};

IdleTimeTracker.defaultProps = {
  operations: []
};

export default React.memo(IdleTimeTracker);