import { useState, useEffect } from 'react';
import { ADMIN_EMAIL, ADMIN_PASSWORD, ADMIN_SESSION_KEY } from '@/constants';
import { AdminSession } from '@/types';

export function useAdminAuth() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const raw = localStorage.getItem(ADMIN_SESSION_KEY);
    if (raw) {
      try {
        const session: AdminSession = JSON.parse(raw);
        const valid = session.loggedIn && session.email === ADMIN_EMAIL;
        setIsLoggedIn(valid);
      } catch {
        setIsLoggedIn(false);
      }
    }
    setLoading(false);
  }, []);

  const login = (email: string, password: string): boolean => {
    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      const session: AdminSession = { email, loggedIn: true, timestamp: Date.now() };
      localStorage.setItem(ADMIN_SESSION_KEY, JSON.stringify(session));
      setIsLoggedIn(true);
      return true;
    }
    return false;
  };

  const logout = () => {
    localStorage.removeItem(ADMIN_SESSION_KEY);
    setIsLoggedIn(false);
  };

  return { isLoggedIn, loading, login, logout };
}

export function checkAdminAuth(): boolean {
  const raw = localStorage.getItem(ADMIN_SESSION_KEY);
  if (!raw) return false;
  try {
    const session: AdminSession = JSON.parse(raw);
    return session.loggedIn && session.email === ADMIN_EMAIL;
  } catch {
    return false;
  }
}
