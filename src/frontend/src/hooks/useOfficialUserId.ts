import { useState, useEffect } from 'react';

const USER_ID_KEY = 'officialUserId';

/**
 * Hook that reads the official user_id from sessionStorage and stays in sync
 * by listening to officialLoginChange and storage events.
 * Mirrors the behavior of useOfficialAdminToken.
 */
export function useOfficialUserId(): string | null {
  const [userId, setUserId] = useState<string | null>(() => {
    return sessionStorage.getItem(USER_ID_KEY);
  });

  useEffect(() => {
    // Re-read on mount to handle navigation after login
    const storedUserId = sessionStorage.getItem(USER_ID_KEY);
    if (storedUserId !== userId) {
      setUserId(storedUserId);
    }
  }, []);

  useEffect(() => {
    const handleStorageChange = () => {
      setUserId(sessionStorage.getItem(USER_ID_KEY));
    };

    // Listen for custom event for same-tab updates
    const handleAuthChange = () => {
      setUserId(sessionStorage.getItem(USER_ID_KEY));
    };

    window.addEventListener('storage', handleStorageChange);
    window.addEventListener('officialLoginChange', handleAuthChange);
    
    return () => {
      window.removeEventListener('storage', handleStorageChange);
      window.removeEventListener('officialLoginChange', handleAuthChange);
    };
  }, []);

  return userId;
}
