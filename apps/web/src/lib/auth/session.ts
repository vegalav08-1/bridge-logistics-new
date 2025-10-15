/**
 * Управление сессиями пользователей
 */

import { AuthSession, verifyJWT } from './jwt';

const SESSION_COOKIE_NAME = 'auth-session';
const SESSION_EXPIRES_DAYS = 7;

export interface UserCredentials {
  email: string;
  password: string;
}

export interface User {
  id: string;
  email: string;
  password: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  name: string;
  isActive: boolean;
}

// Mock база данных пользователей
const mockUsers: User[] = [
  {
    id: 'user-1',
    email: 'vegalav0202@gmail.com',
    password: 'admin123',
    role: 'SUPER_ADMIN',
    name: 'Супер Администратор',
    isActive: true
  },
  {
    id: 'user-2',
    email: 'admin@example.com',
    password: 'admin123',
    role: 'ADMIN',
    name: 'Администратор',
    isActive: true
  },
  {
    id: 'user-3',
    email: 'user@example.com',
    password: 'user123',
    role: 'USER',
    name: 'Пользователь',
    isActive: true
  }
];

export function authenticateUser(credentials: UserCredentials): User | null {
  const user = mockUsers.find(u => 
    u.email === credentials.email && 
    u.password === credentials.password &&
    u.isActive
  );
  
  return user || null;
}

export function getUserById(userId: string): User | null {
  return mockUsers.find(u => u.id === userId) || null;
}

export function getUserByEmail(email: string): User | null {
  return mockUsers.find(u => u.email === email) || null;
}

// Управление сессиями через cookies
export function setSessionCookie(session: AuthSession): void {
  if (typeof document === 'undefined') return;
  
  const expires = new Date();
  expires.setDate(expires.getDate() + SESSION_EXPIRES_DAYS);
  
  document.cookie = `${SESSION_COOKIE_NAME}=${session.token}; expires=${expires.toUTCString()}; path=/; secure; samesite=strict`;
}

export function getSessionCookie(): string | null {
  if (typeof document === 'undefined') return null;
  
  const cookies = document.cookie.split(';');
  const sessionCookie = cookies.find(cookie => 
    cookie.trim().startsWith(`${SESSION_COOKIE_NAME}=`)
  );
  
  if (!sessionCookie) return null;
  
  return sessionCookie.split('=')[1];
}

export function clearSessionCookie(): void {
  if (typeof document === 'undefined') return;
  
  document.cookie = `${SESSION_COOKIE_NAME}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
}

export function getCurrentSession(): AuthSession | null {
  const token = getSessionCookie();
  if (!token) return null;
  
  const payload = verifyJWT(token);
  if (!payload) {
    clearSessionCookie();
    return null;
  }
  
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    token,
    expiresAt: new Date(payload.exp * 1000)
  };
}

// Серверная функция для получения сессии из cookies
export function getServerSession(cookieHeader: string | undefined): AuthSession | null {
  if (!cookieHeader) return null;
  
  const cookies = cookieHeader.split(';').map(c => c.trim());
  const sessionCookie = cookies.find(c => c.startsWith(`${SESSION_COOKIE_NAME}=`));
  
  if (!sessionCookie) return null;
  
  const token = sessionCookie.split('=')[1];
  const payload = verifyJWT(token);
  
  if (!payload) return null;
  
  return {
    userId: payload.userId,
    email: payload.email,
    role: payload.role,
    token,
    expiresAt: new Date(payload.exp * 1000)
  };
}
