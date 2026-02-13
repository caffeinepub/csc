import { useState, useEffect } from 'react';
import { storeSessionParameter, clearSessionParameter, getSessionParameter } from '../utils/urlParams';

const SESSION_KEY = 'official_login_session';
const ADMIN_TOKEN_KEY = 'caffeineAdminToken';
const CREDENTIALS = {
  userId: 'K107172621',
  password: 'Karauli#34',
};

// Hardcoded admin token for Official Login
// This matches the backend ADMIN_SECRET
const ADMIN_SECRET_TOKEN = 'admin-secret-token-2024';

export function useOfficialLogin() {
  const [isOfficiallyLoggedIn, setIsOfficiallyLoggedIn] = useState<boolean>(() => {
    return sessionStorage.getItem(SESSION_KEY) === 'true';
  });

  useEffect(() => {
    const handleStorageChange = () => {
      setIsOfficiallyLoggedIn(sessionStorage.getItem(SESSION_KEY) === 'true');
    };

    // Listen for custom event for same-tab updates
    const handleAuthChange = () => {
      setIsOfficiallyLoggedIn(sessionStorage.getItem(SESSION_KEY) === 'true');
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('officialLoginChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('officialLoginChange', handleAuthChange);
    };
  }, []);

  const login = (userId: string, password: string): boolean => {
    if (userId === CREDENTIALS.userId && password === CREDENTIALS.password) {
      // CRITICAL: Store token FIRST, then set session flag
      // This ensures downstream hooks see the token immediately
      storeSessionParameter(ADMIN_TOKEN_KEY, ADMIN_SECRET_TOKEN);
      sessionStorage.setItem(SESSION_KEY, 'true');
      
      // Update state
      setIsOfficiallyLoggedIn(true);
      
      // Dispatch custom event for same-tab notification AFTER both storage operations
      // Use setTimeout to ensure storage writes complete before event fires
      setTimeout(() => {
        window.dispatchEvent(new CustomEvent('officialLoginChange', { detail: { loggedIn: true } }));
      }, 0);
      
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    clearSessionParameter(ADMIN_TOKEN_KEY);
    setIsOfficiallyLoggedIn(false);
    
    // Dispatch custom event for same-tab notification
    window.dispatchEvent(new CustomEvent('officialLoginChange', { detail: { loggedIn: false } }));
  };

  return {
    isOfficiallyLoggedIn,
    login,
    logout,
  };
}
