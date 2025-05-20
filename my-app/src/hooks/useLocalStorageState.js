import { useState, useEffect } from 'react';

function useLocalStorageState(key, initialValue) {
  const [state, setState] = useState(() => {
    try {
      const stored = localStorage.getItem(key);
      return stored ? (stored.startsWith('{') || stored.startsWith('[') ? JSON.parse(stored) : stored) : initialValue;
    } catch (error) {
      console.error(`Ошибка чтения из localStorage (${key}):`, error);
      return initialValue;
    }
  });

  useEffect(() => {
    try {
      const valueToStore = typeof state === 'object' ? JSON.stringify(state) : state;
      localStorage.setItem(key, valueToStore);
    } catch (error) {
      console.error(`Ошибка записи в localStorage (${key}):`, error);
    }
  }, [key, state]);

  return [state, setState];
}

export default useLocalStorageState;