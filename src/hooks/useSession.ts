'use client';

import { useState, useEffect, useCallback } from 'react';

const SESSION_STORAGE_KEY = 'chat_user_name';

export function useSession() {
  const [userName, setUserName] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Load username from session storage
    const stored = sessionStorage.getItem(SESSION_STORAGE_KEY);
    if (stored) {
      setUserName(stored);
    }
    setLoading(false);
  }, []);

  const saveUserName = useCallback((name: string) => {
    sessionStorage.setItem(SESSION_STORAGE_KEY, name);
    setUserName(name);
  }, []);

  const clearUserName = useCallback(() => {
    sessionStorage.removeItem(SESSION_STORAGE_KEY);
    setUserName(null);
  }, []);

  return {
    userName,
    loading,
    saveUserName,
    clearUserName,
  };
}
