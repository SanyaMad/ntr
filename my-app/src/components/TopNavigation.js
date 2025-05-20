import React, { useState, useEffect } from 'react';
import { NavLink, useLocation } from 'react-router-dom';
import PropTypes from 'prop-types';

const TopNavigation = ({ items = [], userRole }) => {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isScrolled, setIsScrolled] = useState(false);
  const location = useLocation();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    const handleResize = () => {
      if (window.innerWidth > 768) {
        setIsMobileMenuOpen(false);
      }
    };

    window.addEventListener('scroll', handleScroll, { passive: true });
    window.addEventListener('resize', handleResize);

    return () => {
      window.removeEventListener('scroll', handleScroll);
      window.removeEventListener('resize', handleResize);
    };
  }, []);

  // Фильтрация пунктов меню на основе роли пользователя
  const filteredItems = items.filter(item => {
    if (!item.requiredRole) return true;
    return userRole && item.requiredRole === userRole;
  });

  const isActive = (path) => {
    if (path === '/') {
      return location.pathname === '/';
    }
    return location.pathname.startsWith(path);
  };

  return (
    <nav style={{
      backgroundColor: isScrolled ? 'rgba(255, 255, 255, 0.95)' : 'white',
      backdropFilter: isScrolled ? 'blur(8px)' : 'none',
      boxShadow: isScrolled ? '0 2px 8px rgba(0,0,0,0.1)' : 'none',
      position: 'sticky',
      top: 0,
      zIndex: 100,
      transition: 'all 0.3s ease'
    }}>
      <div style={{
        maxWidth: '1200px',
        margin: '0 auto',
        padding: '0 20px'
      }}>
        <div style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          height: '60px'
        }}>
          {/* Мобильная кнопка меню */}
          <button
            onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
            style={{
              display: 'none',
              background: 'none',
              border: 'none',
              padding: '8px',
              cursor: 'pointer'
            }}
            aria-label="Открыть меню"
            className="topnav-mobile-btn"
          >
            <svg
              width="24"
              height="24"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              {isMobileMenuOpen ? (
                <>
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </>
              ) : (
                <>
                  <line x1="3" y1="12" x2="21" y2="12" />
                  <line x1="3" y1="6" x2="21" y2="6" />
                  <line x1="3" y1="18" x2="21" y2="18" />
                </>
              )}
            </svg>
          </button>

          {/* Навигационные ссылки */}
          <div
            className={`topnav-links${isMobileMenuOpen ? ' open' : ''}`}
            style={{
              display: 'flex',
              gap: '8px'
            }}
          >
            {filteredItems.map((item, index) => (
              <NavLink
                key={index}
                to={item.path}
                style={{
                  padding: '8px 16px',
                  textDecoration: 'none',
                  color: isActive(item.path) ? 'var(--primary)' : 'var(--text)',
                  borderRadius: '8px',
                  transition: 'all 0.2s ease',
                  position: 'relative',
                  ':hover': {
                    backgroundColor: 'var(--background)'
                  },
                  ':after': isActive(item.path) ? {
                    content: '""',
                    position: 'absolute',
                    bottom: '-2px',
                    left: '50%',
                    transform: 'translateX(-50%)',
                    width: '4px',
                    height: '4px',
                    borderRadius: '50%',
                    backgroundColor: 'var(--primary)'
                  } : {}
                }}
                onClick={() => setIsMobileMenuOpen(false)}
              >
                <div style={{
                  display: 'flex',
                  alignItems: 'center',
                  gap: '8px'
                }}>
                  {item.icon && (
                    <span style={{
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      width: '24px',
                      height: '24px'
                    }}>
                      {item.icon}
                    </span>
                  )}
                  {item.label}
                </div>
              </NavLink>
            ))}
          </div>
        </div>
      </div>
      {/* Затемнение фона при открытом мобильном меню */}
      {isMobileMenuOpen && (
        <div
          onClick={() => setIsMobileMenuOpen(false)}
          className="topnav-mobile-overlay"
        />
      )}

      <style>
        {`
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

          @keyframes fadeIn {
            from {
              opacity: 0;
            }
            to {
              opacity: 1;
            }
          }

          .topnav-mobile-btn {
            display: none;
          }
          .topnav-links {
            display: flex;
            gap: 8px;
          }
          .topnav-mobile-overlay {
            position: fixed;
            top: 60px;
            left: 0;
            right: 0;
            bottom: 0;
            background-color: rgba(0, 0, 0, 0.5);
            animation: fadeIn 0.3s ease;
            z-index: 100;
            display: block;
          }
          @media (max-width: 768px) {
            .topnav-mobile-btn {
              display: block !important;
            }
            .topnav-links {
              display: none;
              position: absolute;
              top: 60px;
              left: 0;
              right: 0;
              flex-direction: column;
              background-color: white;
              padding: 16px;
              box-shadow: 0 4px 8px rgba(0,0,0,0.1);
              animation: slideDown 0.3s ease;
              z-index: 101;
            }
            .topnav-links.open {
              display: flex;
            }
          }
        `}
      </style>
    </nav>
  );
};

TopNavigation.propTypes = {
  items: PropTypes.arrayOf(PropTypes.shape({
    path: PropTypes.string.isRequired,
    label: PropTypes.string.isRequired,
    icon: PropTypes.node,
    requiredRole: PropTypes.string
  })),
  userRole: PropTypes.string
};

export default React.memo(TopNavigation);