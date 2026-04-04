import { createContext, useContext, useState, useCallback, useEffect } from 'react';
import { setAuthToken, getAuthToken } from '../services/api';

const AppContext = createContext(null);

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [state, setState] = useState(() => {
    const savedToken = getAuthToken();
    const savedTheme = localStorage.getItem('theme') || 'dark';
    return {
      currentPage: 'login',
      regStep: 1,
      kycDone: false,
      selectedTier: 'standard',
      workerName: '',
      weeklyEarnings: 4500,
      dailyBaseline: 750,
      zone: 'andheri_west',
      city: 'mumbai',
      alertCount: 0,
      workerId: '',
      platform: 'zomato',
      platformId: '',
      phone: '',
      upiId: '',
      tenure: 14,
      loyaltyDiscount: 0.05,
      consistencyScore: 91,
      triggerHistory: [],
      claimHistory: [],
      policyStartDate: '2024-01-01',
      lastPremiumUpdate: null,
      activeTriggers: [],
      token: savedToken,
      email: '',
      theme: savedTheme,
    };
  });

  useEffect(() => {
    document.documentElement.setAttribute('data-theme', state.theme);
  }, [state.theme]);

  const setTheme = (theme) => {
    localStorage.setItem('theme', theme);
    document.documentElement.setAttribute('data-theme', theme);
    setState(prev => ({ ...prev, theme }));
  };

  const toggleTheme = () => {
    const newTheme = state.theme === 'dark' ? 'light' : 'dark';
    setTheme(newTheme);
  };

  const [toasts, setToasts] = useState([]);
  const [notifications, setNotifications] = useState([]);

  const showToast = useCallback((message, type = 'info') => {
    const id = Date.now();
    setToasts((prev) => [...prev, { id, message, type }]);
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id));
    }, 4000);
  }, []);

  const addNotification = useCallback((notification) => {
    const id = Date.now();
    const newNotification = { id, ...notification, timestamp: new Date(), read: false };
    setNotifications((prev) => [newNotification, ...prev].slice(0, 50));
  }, []);

  const markNotificationRead = useCallback((id) => {
    setNotifications((prev) => 
      prev.map(n => n.id === id ? { ...n, read: true } : n)
    );
  }, []);

  const clearNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  const updateState = useCallback((updates) => {
    if (updates.token) {
      setAuthToken(updates.token);
    }
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  const addClaim = useCallback((claim) => {
    setState((prev) => ({
      ...prev,
      claimHistory: [claim, ...prev.claimHistory],
    }));
  }, []);

  const addTriggerEvent = useCallback((trigger) => {
    setState((prev) => ({
      ...prev,
      triggerHistory: [trigger, ...prev.triggerHistory].slice(0, 50),
    }));
  }, []);

  const logout = useCallback(() => {
    setAuthToken(null);
    setState((prev) => ({
      ...prev,
      kycDone: false,
      workerName: '',
      workerId: '',
      phone: '',
      token: null,
      email: '',
    }));
  }, []);

  const value = {
    state,
    updateState,
    toasts,
    showToast,
    notifications,
    addNotification,
    markNotificationRead,
    clearNotifications,
    addClaim,
    addTriggerEvent,
    logout,
    setTheme,
    toggleTheme,
  };

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>;
};

export default AppContext;
