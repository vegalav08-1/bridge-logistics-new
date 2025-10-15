import jwt from 'jsonwebtoken';
import crypto from 'node:crypto';

export function signAccess(payload: object) {
  return jwt.sign(payload, process.env.JWT_SECRET!, { expiresIn: '24h' });
}

export function signRefresh(payload: object) {
  return jwt.sign(payload, process.env.REFRESH_SECRET!, { expiresIn: '30d' });
}

export function verifyAccess(token: string) {
  return jwt.verify(token, process.env.JWT_SECRET!);
}

export function verifyRefresh(token: string) {
  return jwt.verify(token, process.env.REFRESH_SECRET!);
}

export const sha256 = (s: string) => crypto.createHash('sha256').update(s).digest('hex');

