import { useState, useEffect } from 'react';
import { getSessionParameter } from '../utils/urlParams';

const ADMIN_TOKEN_KEY = 'caffeineAdminToken';

/**
 * Hook that reads the admin secret token from sessionStorage
 * and stays in sync within the same tab by listening to officialLoginChange events.
 * This enables downstream actor creation to always have the latest token.
 * Re-reads from sessionStorage on mount and on every auth change event.
 */
export function useOfficialAdminToken(): string | null {
  const [token, setToken] = useState<string | null>(() => {
    return getSessionParameter(ADMIN_TOKEN_KEY);
  });

  useEffect(() => {
    // Re-read token from storage on mount (handles navigation to /admin after login)
    const currentToken = getSessionParameter(ADMIN_TOKEN_KEY);
    if (currentToken !== token) {
      setToken(currentToken);
    }
  }, []); // Run once on mount

  useEffect(() => {
    const handleAuthChange = () => {
      // Always re-read from sessionStorage on auth change
      const latestToken = getSessionParameter(ADMIN_TOKEN_KEY);
      setToken(latestToken);
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
