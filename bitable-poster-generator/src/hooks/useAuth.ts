import { useState, useEffect, useCallback } from 'react';
import { bitable } from '@lark-base-open/js-sdk';
import {
  setAuthToken,
  getAuthToken,
  pluginLogin,
  getMe,
  logout as apiLogout,
  type AuthUser,
} from '../services/api';

export interface AuthState {
  user: AuthUser | null;
  loading: boolean;
  error: string | null;
  logout: () => Promise<void>;
}

const SESSION_KEY = 'poster-auth-token';

export function useAuth(): AuthState {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;

    async function init() {
      // 1. Try restoring saved session
      const savedToken = sessionStorage.getItem(SESSION_KEY);
      if (savedToken) {
        setAuthToken(savedToken);
        try {
          const { user: u } = await getMe();
          if (!cancelled) { setUser(u); setLoading(false); }
          return;
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
          setAuthToken(null);
        }
      }

      // 2. Try plugin login via Bitable SDK (with 2s timeout)
      try {
        const userId = await Promise.race([
          bitable.bridge.getUserId(),
          new Promise<null>((_, reject) => setTimeout(() => reject(new Error('timeout')), 2000)),
        ]);
        if (userId) {
          const { token, user: u } = await pluginLogin(userId);
          setAuthToken(token);
          sessionStorage.setItem(SESSION_KEY, token);
          if (!cancelled) { setUser(u); setLoading(false); }
          return;
        }
      } catch {
        // SDK not available or timeout
      }

      // 3. Check URL for OAuth callback token
      const url = new URL(window.location.href);
      const urlToken = url.searchParams.get('session_token');
      if (urlToken) {
        setAuthToken(urlToken);
        sessionStorage.setItem(SESSION_KEY, urlToken);
        url.searchParams.delete('session_token');
        window.history.replaceState({}, '', url.toString());
        try {
          const { user: u } = await getMe();
          if (!cancelled) { setUser(u); setLoading(false); }
          return;
        } catch {
          sessionStorage.removeItem(SESSION_KEY);
          setAuthToken(null);
        }
      }

      // 4. Not logged in
      if (!cancelled) { setLoading(false); }
    }

    init().catch((e) => {
      if (!cancelled) { setError(e.message); setLoading(false); }
    });

    return () => { cancelled = true; };
  }, []);

  const logout = useCallback(async () => {
    if (getAuthToken()) {
      try { await apiLogout(); } catch { /* ignore */ }
    }
    sessionStorage.removeItem(SESSION_KEY);
    setAuthToken(null);
    setUser(null);
  }, []);

  return { user, loading, error, logout };
}
