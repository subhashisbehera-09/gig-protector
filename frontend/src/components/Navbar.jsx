import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import { useApp } from '../context/AppContext';
import { useEffect, useRef, useState } from 'react';
import { LogoWithText } from './Logo';

const navItems = [
  { path: '/dashboard', label: 'Dashboard' },
  { path: '/register', label: 'Register' },
  { path: '/policy', label: 'Policy' },
  { path: '/premium', label: 'Premium' },
  { path: '/claims', label: 'Claims' },
  { path: '/triggers', label: 'Triggers' },
];

const registerNavItems = [
  { path: '/register', label: 'Register' },
  { path: '/login', label: 'Login' },
];

export const Navbar = () => {
  const { state, logout, showToast, toggleTheme, notifications, markNotificationRead, clearNotifications } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const navRefs = useRef([]);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [notifOpen, setNotifOpen] = useState(false);
  const notifRef = useRef(null);

  const isRegisterPage = location.pathname === '/register';
  const isLoginPage = location.pathname === '/login';
  const isAuthPage = isRegisterPage || isLoginPage;
  const showHomeButton = isLoginPage; // Show home only on login page, not register
  const currentNavItems = isAuthPage ? registerNavItems : navItems;
  const currentIndex = currentNavItems.findIndex(item => item.path === location.pathname);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (!isAuthPage) {
        if (e.key === 'ArrowRight') {
          e.preventDefault();
          const nextIndex = (currentIndex + 1) % currentNavItems.length;
          navigate(currentNavItems[nextIndex].path);
          navRefs.current[nextIndex]?.focus();
        } else if (e.key === 'ArrowLeft') {
          e.preventDefault();
          const prevIndex = (currentIndex - 1 + currentNavItems.length) % currentNavItems.length;
          navigate(currentNavItems[prevIndex].path);
          navRefs.current[prevIndex]?.focus();
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [currentIndex, navigate, currentNavItems, isAuthPage]);

  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location.pathname]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (notifRef.current && !notifRef.current.contains(e.target)) {
        setNotifOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    if (mobileMenuOpen) {
      document.body.classList.add('mobile-menu-open');
    } else {
      document.body.classList.remove('mobile-menu-open');
    }
    return () => document.body.classList.remove('mobile-menu-open');
  }, [mobileMenuOpen]);

  const handleLogout = () => {
    logout();
    showToast('Logged out successfully', 'success');
    navigate('/');
  };

  const toggleMobileMenu = () => {
    setMobileMenuOpen(!mobileMenuOpen);
  };

  const handleBack = () => {
    navigate(-1);
  };

  const handleHome = () => {
    navigate('/');
  };

  const isAuthenticated = state.kycDone || state.token;

  return (
    <nav className="navbar">
      <div className="nav-logo" onClick={() => navigate('/')} style={{ cursor: 'pointer' }}>
        <img src="/logo.png" alt="GigProtector" className="logo-img" style={{ width: 48, height: 48, borderRadius: 12, filter: 'drop-shadow(0 0 10px rgba(99, 102, 241, 0.5))' }} />
        <div className="logo-text">
          <span className="logo-title">GigProtector</span>
          <span className="logo-subtitle">Protect Your Income</span>
        </div>
      </div>
      
      {isAuthPage ? (
        <div className="auth-nav-center">
          <button className="auth-nav-btn auth-nav-back" onClick={handleBack}>
            <span className="auth-nav-icon">←</span>
            <span className="auth-nav-text">Back</span>
          </button>
          {showHomeButton && (
            <button className="auth-nav-btn auth-nav-home" onClick={handleHome}>
              <span className="auth-nav-icon">🏠</span>
              <span className="auth-nav-text">Home</span>
            </button>
          )}
        </div>
      ) : (
        <div className="nav-tabs">
          {isAuthenticated ? currentNavItems.map((item, index) => (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}
              ref={el => navRefs.current[index] = el}
            >
              {item.label}
              {item.label === 'Triggers' && state.alertCount > 0 && (
                <span className="nav-badge">{state.alertCount}</span>
              )}
            </NavLink>
          )) : (
            <>
              <NavLink to="/login" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>Login</NavLink>
              <NavLink to="/register" className={({ isActive }) => `nav-tab ${isActive ? 'active' : ''}`}>Register</NavLink>
            </>
          )}
        </div>
      )}
      
      <div className="nav-user">
        {isAuthenticated && !isAuthPage && (
          <div className="notification-wrapper" ref={notifRef}>
            <button 
              className="notification-btn"
              onClick={() => setNotifOpen(!notifOpen)}
            >
              🔔
              {notifications.filter(n => !n.read).length > 0 && (
                <span className="notification-badge">{notifications.filter(n => !n.read).length}</span>
              )}
            </button>
            {notifOpen && (
              <div className="notification-dropdown">
                <div className="notif-header">
                  <span>Notifications</span>
                  {notifications.length > 0 && (
                    <button onClick={clearNotifications} className="notif-clear">Clear all</button>
                  )}
                </div>
                <div className="notif-list">
                  {notifications.length === 0 ? (
                    <div className="notif-empty">No notifications</div>
                  ) : (
                    notifications.map(n => (
                      <div 
                        key={n.id} 
                        className={`notif-item ${n.read ? 'read' : ''} ${n.type}`}
                        onClick={() => markNotificationRead(n.id)}
                      >
                        <span className="notif-icon">
                          {n.type === 'alert' ? '⚠️' : n.type === 'success' ? '✅' : 'ℹ️'}
                        </span>
                        <div className="notif-content">
                          <span className="notif-title">{n.title}</span>
                          <span className="notif-msg">{n.message}</span>
                          <span className="notif-time">{new Date(n.timestamp).toLocaleTimeString()}</span>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        )}
        <button 
          className="theme-toggle" 
          onClick={toggleTheme}
          title={state.theme === 'dark' ? 'Switch to Light Mode' : 'Switch to Dark Mode'}
        >
          {state.theme === 'dark' ? '☀️' : '🌙'}
        </button>
        {state.workerName && isAuthenticated && !isAuthPage && (
          <div className="user-info-mini">
            <span className="user-name">{state.workerName}</span>
            <span className="user-id">{state.workerId}</span>
          </div>
        )}
        {isAuthenticated && !isAuthPage && (
          <button className="btn btn-outline btn-sm btn-logout" onClick={handleLogout}>
            Logout
          </button>
        )}
      </div>
      <button className="mobile-menu-btn" onClick={toggleMobileMenu}>
        <div className={`hamburger ${mobileMenuOpen ? 'active' : ''}`}>
          <span></span>
          <span></span>
          <span></span>
        </div>
      </button>
      <div className={`mobile-menu ${mobileMenuOpen ? 'active' : ''}`}>
        <div className="mobile-menu-content">
          {isAuthenticated ? (
            <>
              {currentNavItems.map((item, index) => (
                <NavLink
                  key={item.path}
                  to={item.path}
                  className={({ isActive }) => `mobile-nav-tab ${isActive ? 'active' : ''}`}
                  onClick={() => setMobileMenuOpen(false)}
                  ref={el => navRefs.current[index] = el}
                >
                  {item.label}
                  {item.label === 'Triggers' && state.alertCount > 0 && (
                    <span className="nav-badge">{state.alertCount}</span>
                  )}
                </NavLink>
              ))}
              <button className="btn btn-outline btn-sm mobile-logout-btn" onClick={handleLogout}>
                Logout
              </button>
            </>
          ) : (
            <>
              <button className="mobile-nav-btn active" onClick={() => { navigate('/'); setMobileMenuOpen(false); }}>
                🏠 Home
              </button>
              <button className="mobile-nav-btn" onClick={() => { navigate('/login'); setMobileMenuOpen(false); }}>
                Login
              </button>
              <button className="mobile-nav-btn" onClick={() => { navigate('/register'); setMobileMenuOpen(false); }}>
                Register
              </button>
            </>
          )}
        </div>
      </div>
    </nav>
  );
};
