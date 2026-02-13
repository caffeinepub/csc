import { useState, useEffect } from 'react';
import { storeSessionParameter, clearSessionParameter } from '../utils/urlParams';

const SESSION_KEY = 'official_login_session';
const USER_ID_KEY = 'officialUserId';
const CREDENTIALS = {
  userId: 'K107172621',
  password: 'Karauli#34',
};

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
      // Store user_id and set session flag (no token needed for bypass)
      sessionStorage.setItem(USER_ID_KEY, userId);
      sessionStorage.setItem(SESSION_KEY, 'true');
      
      // Update state
      setIsOfficiallyLoggedIn(true);
      
      // Dispatch custom event for same-tab notification AFTER all storage operations
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
    sessionStorage.removeItem(USER_ID_KEY);
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
