import { useCallback } from 'react';
import { useAuth } from './useAuth.js';

export function useApi() {
  const { token, logout } = useAuth();

  const apiFetch = useCallback(async (url, options = {}) => {
    const headers = {
      'Content-Type': 'application/json',
      ...options.headers,
    };
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(url, { ...options, headers });

    if (res.status === 401 || res.status === 403) {
      logout();
      throw new Error('Sitzung abgelaufen');
    }

    if (!res.ok) {
      const data = await res.json().catch(() => ({}));
      throw new Error(data.error || `Fehler ${res.status}`);
    }

    return res.json();
  }, [token, logout]);

  return { apiFetch };
}
