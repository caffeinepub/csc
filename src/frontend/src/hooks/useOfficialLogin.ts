import { useState, useEffect } from 'react';

const SESSION_KEY = 'official_login_session';
const CREDENTIALS = {
  userId: 'K107182721',
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

    window.addEventListener('storage', handleStorageChange);
    return () => window.removeEventListener('storage', handleStorageChange);
  }, []);

  const login = (userId: string, password: string): boolean => {
    if (userId === CREDENTIALS.userId && password === CREDENTIALS.password) {
      sessionStorage.setItem(SESSION_KEY, 'true');
      setIsOfficiallyLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    sessionStorage.removeItem(SESSION_KEY);
    setIsOfficiallyLoggedIn(false);
  };

  return {
    isOfficiallyLoggedIn,
    login,
    logout,
  };
}
