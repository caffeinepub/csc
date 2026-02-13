import { useState, useEffect } from 'react';
import { getSessionParameter } from '../utils/urlParams';

const ADMIN_TOKEN_KEY = 'caffeineAdminToken';

/**
 * Hook that reads the admin secret token from sessionStorage
 * and stays in sync within the same tab by listening to officialLoginChange events.
 * This enables downstream actor creation to always have the latest token.
 */
export function useOfficialAdminToken(): string | null {
  const [token, setToken] = useState<string | null>(() => {
    return getSessionParameter(ADMIN_TOKEN_KEY);
  });

  useEffect(() => {
    const handleAuthChange = () => {
      setToken(getSessionParameter(ADMIN_TOKEN_KEY));
    };

    // Listen for custom event for same-tab updates
    window.addEventListener('officialLoginChange', handleAuthChange);
    
    // Also listen to storage events (for cross-tab sync if needed)
    window.addEventListener('storage', handleAuthChange);
    
    return () => {
      window.removeEventListener('officialLoginChange', handleAuthChange);
      window.removeEventListener('storage', handleAuthChange);
    };
  }, []);

  return token;
}
