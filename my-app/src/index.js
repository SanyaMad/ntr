import React from 'react';
import ReactDOM from 'react-dom/client';
import './index.css';
import App from './App'; // Убедитесь, что путь к App.js правильный

const container = document.getElementById('root');
if (!container) {
  throw new Error('Не удалось найти элемент с id "root"');
}

const root = ReactDOM.createRoot(container);
root.render(
  <React.StrictMode>
    <App /> {/* Убедимся, что рендерим App */}
  </React.StrictMode>
);