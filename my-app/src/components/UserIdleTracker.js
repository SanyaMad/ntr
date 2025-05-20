import { useState, useCallback, useEffect, useRef } from 'react';

const UserIdleTracker = ({ onIdle, idleTime = 300000 }) => {
  const [isIdle, setIsIdle] = useState(false);
  const lastActivityRef = useRef(Date.now());
  const checkIntervalRef = useRef(null);

  const resetTimer = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (isIdle) {
      setIsIdle(false);
    }
  }, [isIdle]);

  const handleActivity = useCallback((event) => {
    // Предотвращаем множественные вызовы при быстрых событиях
    if (Date.now() - lastActivityRef.current < 100) return;
    resetTimer();
  }, [resetTimer]);

  useEffect(() => {
    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart'];
    const options = { passive: true }; // Оптимизация производительности

    events.forEach(event => {
      window.addEventListener(event, handleActivity, options);
    });

    checkIntervalRef.current = setInterval(() => {
      if (Date.now() - lastActivityRef.current > idleTime) {
        setIsIdle(true);
        if (onIdle) onIdle();
      }
    }, 10000);

    return () => {
      events.forEach(event => {
        window.removeEventListener(event, handleActivity);
      });
      if (checkIntervalRef.current) {
        clearInterval(checkIntervalRef.current);
      }
    };
  }, [handleActivity, idleTime, onIdle]);

  return null;
};

export default UserIdleTracker;