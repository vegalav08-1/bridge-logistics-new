/**
 * JWT токены для аутентификации
 */

export interface JWTPayload {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  iat: number;
  exp: number;
}

export interface AuthSession {
  userId: string;
  email: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'USER';
  token: string;
  expiresAt: Date;
}

// Простая реализация JWT (в продакшене использовать библиотеку jsonwebtoken)
export function createJWT(payload: Omit<JWTPayload, 'iat' | 'exp'>): string {
  const now = Math.floor(Date.now() / 1000);
  const exp = now + (24 * 60 * 60); // 24 часа
  
  const jwtPayload = {
    ...payload,
    iat: now,
    exp: exp
  };
  
  // Простая кодировка Base64 (в продакшене использовать библиотеку)
  const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
  const payloadB64 = btoa(JSON.stringify(jwtPayload));
  const signature = btoa('mock-signature'); // В продакшене использовать HMAC
  
  return `${header}.${payloadB64}.${signature}`;
}

export function verifyJWT(token: string): JWTPayload | null {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    
    const payload = JSON.parse(atob(parts[1]));
    
    // Проверяем срок действия
    const now = Math.floor(Date.now() / 1000);
    if (payload.exp < now) return null;
    
    return payload;
  } catch (error) {
    return null;
  }
}

export function createAuthSession(userId: string, email: string, role: 'SUPER_ADMIN' | 'ADMIN' | 'USER'): AuthSession {
  const token = createJWT({ userId, email, role });
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000); // 24 часа
  
  return {
    userId,
    email,
    role,
    token,
    expiresAt
  };
}
