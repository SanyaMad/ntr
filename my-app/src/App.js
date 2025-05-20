import React, { useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import './App.css';

import HomeScreen from './screens/HomeScreen';
import NewRecord from './screens/NewRecord';
import BlockScreen from './screens/BlockScreen';
import HistoryScreen from './screens/HistoryScreen';
import AdminDashboard from './screens/AdminDashboard';
import SettingsScreen from './screens/SettingsScreen';
import LoginScreen from './screens/LoginScreen';
import AuthGuard from './components/AuthGuard';
import UserIdleTracker from './components/UserIdleTracker';
import SyncIndicator from './components/SyncIndicator';
import TopNavigation from './components/TopNavigation';
import { OPERATOR_STORAGE_KEY } from './constants';
import { syncService } from './services/SyncService';

function App() {
  useEffect(() => {
    syncService.startSync()
      .catch(error => console.error('Ошибка при запуске синхронизации:', error));

    return () => {
      syncService.stopSync();
    };
  }, []);

  // Проверяем, авторизован ли пользователь
  const isAuthenticated = Boolean(localStorage.getItem(OPERATOR_STORAGE_KEY));

  return (
    <Router>
      <div className="App">
        <UserIdleTracker />
        {isAuthenticated && <SyncIndicator />}
        
        <div className="app-container">
          {isAuthenticated && <TopNavigation />}
          
          <main className="main-content">
            <Routes>
              <Route path="/login" element={
                isAuthenticated ? <Navigate to="/" replace /> : <LoginScreen />
              } />
              
              <Route path="/" element={
                <AuthGuard>
                  <HomeScreen />
                </AuthGuard>
              } />

              <Route path="/new-record" element={
                <AuthGuard>
                  <NewRecord />
                </AuthGuard>
              } />

              <Route path="/block/:blockId" element={
                <AuthGuard>
                  <BlockScreen />
                </AuthGuard>
              } />

              <Route path="/history" element={
                <AuthGuard>
                  <HistoryScreen />
                </AuthGuard>
              } />

              <Route path="/admin" element={
                <AuthGuard requireAdmin>
                  <AdminDashboard />
                </AuthGuard>
              } />

              <Route path="/settings" element={
                <AuthGuard>
                  <SettingsScreen />
                </AuthGuard>
              } />

              <Route path="*" element={<Navigate to="/" replace />} />
            </Routes>
          </main>
        </div>
      </div>
    </Router>
  );
}

export default App;