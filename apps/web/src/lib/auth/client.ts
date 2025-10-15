'use client';

import { useState, useEffect } from 'react';

// Хранилище токена в localStorage
const ACCESS_TOKEN_KEY = 'access_token';

export function getAccessToken(): string | null {
  if (typeof window === 'undefined') return null;
  return localStorage.getItem(ACCESS_TOKEN_KEY);
}

export function setAccessToken(token: string): void {
  if (typeof window === 'undefined') return;
  localStorage.setItem(ACCESS_TOKEN_KEY, token);
}

export function removeAccessToken(): void {
  if (typeof window === 'undefined') return;
  localStorage.removeItem(ACCESS_TOKEN_KEY);
}

export function useAuth() {
  const [token, setToken] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const storedToken = getAccessToken();
    setToken(storedToken);
    setIsLoading(false);
  }, []);

  const login = (newToken: string) => {
    setAccessToken(newToken);
    setToken(newToken);
  };

  const logout = async () => {
    try {
      // Выполняем logout через API
      await fetch('/api/auth/logout', {
        method: 'POST',
        credentials: 'include',
      });
    } catch (error) {
      console.error('Logout API error:', error);
    } finally {
      // В любом случае очищаем токен
      removeAccessToken();
      setToken(null);
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    try {
      const response = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        setAccessToken(data.accessToken);
        setToken(data.accessToken);
        return true;
      } else {
        logout();
        return false;
      }
    } catch (error) {
      console.error('Token refresh failed:', error);
      logout();
      return false;
    }
  };

  return {
    token,
    isAuthenticated: !!token,
    isLoading,
    login,
    logout,
    refreshToken,
  };
}