import React, { useState, useCallback, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import PropTypes from 'prop-types';

const Header = ({ 
  title, 
  userName,
  notificationCount = 0,
  onNotificationsClick,
  customActions,
  showBackToHome = true // новое свойство, по умолчанию true
}) => {
  const navigate = useNavigate();
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);

  // Отслеживание скролла для изменения внешнего вида шапки
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const handleLogout = useCallback(() => {
    if (window.confirm('Вы уверены, что хотите выйти?')) {
      localStorage.removeItem('currentOperator');
      navigate('/login');
    }
  }, [navigate]);

  const handleProfileClick = useCallback(() => {
    navigate('/profile');
    setIsDropdownOpen(false);
  }, [navigate]);

  // Глобальная фиксированная кнопка "На главную"
  const showGlobalBackToHome = showBackToHome && window.location.pathname !== '/';

  return (
    <>
      {showGlobalBackToHome && (
        <button
          onClick={() => navigate('/')}
          className="back-to-home-btn-global"
          aria-label="На главную"
        >
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#2563eb" strokeWidth="2">
            <polyline points="15 18 9 12 15 6"/>
          </svg>
          <span>На главную</span>
        </button>
      )}
      <header style={{
        position: 'sticky',
        top: 0,
        backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'white',
        backdropFilter: isScrolled ? 'blur(8px)' : 'none',
        boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
        padding: '16px 24px',
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        transition: 'all 0.3s ease',
        zIndex: 100
      }}>
        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '16px'
        }}>
          {/* Удаляем старую кнопку "На главную" из шапки */}
          <h1 style={{
            margin: 0,
            fontSize: '24px',
            color: 'var(--text-primary)',
            transition: 'transform 0.2s ease'
          }}>
            {title}
          </h1>
        </div>

        <div style={{
          display: 'flex',
          alignItems: 'center',
          gap: '20px'
        }}>
          {customActions}

          {onNotificationsClick && (
            <button
              onClick={onNotificationsClick}
              style={{
                position: 'relative',
                padding: '8px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-secondary)',
                transition: 'color 0.2s ease'
              }}
            >
              <svg 
                width="24" 
                height="24" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
              >
                <path d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"></path>
                <path d="M13.73 21a2 2 0 0 1-3.46 0"></path>
              </svg>
              
              {notificationCount > 0 && (
                <span style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  backgroundColor: 'var(--error)',
                  color: 'white',
                  fontSize: '12px',
                  fontWeight: 'bold',
                  padding: '2px 6px',
                  borderRadius: '10px',
                  minWidth: '18px',
                  textAlign: 'center',
                  animation: 'bounce 0.5s ease'
                }}>
                  {notificationCount > 99 ? '99+' : notificationCount}
                </span>
              )}
            </button>
          )}

          <div style={{ position: 'relative' }}>
            <button
              onClick={() => setIsDropdownOpen(!isDropdownOpen)}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 12px',
                backgroundColor: 'transparent',
                border: 'none',
                cursor: 'pointer',
                color: 'var(--text-primary)',
                borderRadius: '4px',
                transition: 'all 0.2s ease',
                ':hover': {
                  backgroundColor: 'var(--background)'
                }
              }}
            >
              <div style={{
                width: '32px',
                height: '32px',
                backgroundColor: 'var(--primary)',
                color: 'white',
                borderRadius: '50%',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '16px',
                fontWeight: 'bold'
              }}>
                {userName?.[0]?.toUpperCase() || 'U'}
              </div>
              <span>{userName || 'Пользователь'}</span>
              <svg 
                width="16" 
                height="16" 
                viewBox="0 0 24 24" 
                fill="none" 
                stroke="currentColor" 
                strokeWidth="2"
                style={{
                  transform: isDropdownOpen ? 'rotate(180deg)' : 'none',
                  transition: 'transform 0.2s ease'
                }}
              >
                <path d="M6 9l6 6 6-6"/>
              </svg>
            </button>

            {isDropdownOpen && (
              <div style={{
                position: 'absolute',
                top: '100%',
                right: 0,
                marginTop: '8px',
                backgroundColor: 'white',
                borderRadius: '8px',
                boxShadow: '0 4px 12px rgba(0,0,0,0.1)',
                padding: '8px 0',
                minWidth: '200px',
                animation: 'slideDown 0.2s ease'
              }}>
                <button
                  onClick={handleProfileClick}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--text-primary)',
                    transition: 'background-color 0.2s ease',
                    ':hover': {
                      backgroundColor: 'var(--background)'
                    }
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M20 21v-2a4 4 0 0 0-4-4H8a4 4 0 0 0-4 4v2"></path>
                    <circle cx="12" cy="7" r="4"></circle>
                  </svg>
                  Профиль
                </button>

                <hr style={{
                  margin: '8px 0',
                  border: 'none',
                  borderTop: '1px solid var(--border)'
                }} />

                <button
                  onClick={handleLogout}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px',
                    width: '100%',
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    color: 'var(--error)',
                    transition: 'background-color 0.2s ease',
                    ':hover': {
                      backgroundColor: 'var(--background)'
                    }
                  }}
                >
                  <svg 
                    width="16" 
                    height="16" 
                    viewBox="0 0 24 24" 
                    fill="none" 
                    stroke="currentColor" 
                    strokeWidth="2"
                  >
                    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path>
                    <polyline points="16 17 21 12 16 7"></polyline>
                    <line x1="21" y1="12" x2="9" y2="12"></line>
                  </svg>
                  Выйти
                </button>
              </div>
            )}
          </div>
        </div>

      </header>
      <style>
        {`
          .back-to-home-btn-global {
            position: fixed;
            top: 18px;
            left: 18px;
            display: flex;
            align-items: center;
            gap: 6px;
            background: #f3f6fd;
            color: #2563eb;
            border: none;
            border-radius: 8px;
            padding: 8px 16px 8px 10px;
            font-size: 15px;
            font-weight: 500;
            box-shadow: 0 2px 8px rgba(37,99,235,0.07);
            cursor: pointer;
            transition: background 0.18s, box-shadow 0.18s, color 0.18s;
            z-index: 2000;
          }
          .back-to-home-btn-global:hover, .back-to-home-btn-global:focus {
            background: #e0eaff;
            color: #1746a2;
            box-shadow: 0 4px 16px rgba(37,99,235,0.12);
          }
          .back-to-home-btn-global svg {
            display: block;
          }

          @keyframes slideDown {
            from {
              opacity: 0;
              transform: translateY(-10px);
            }
            to {
              opacity: 1;
              transform: translateY(0);
            }
          }

          @keyframes bounce {
            0%, 100% {
              transform: scale(1);
            }
            50% {
              transform: scale(1.2);
            }
          }
        `}
      </style>
    </>
  );
};

Header.propTypes = {
  title: PropTypes.string.isRequired,
  userName: PropTypes.string,
  notificationCount: PropTypes.number,
  onNotificationsClick: PropTypes.func,
  customActions: PropTypes.node,
  showBackToHome: PropTypes.bool
};

export default React.memo(Header);
