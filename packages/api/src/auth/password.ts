import bcrypt from 'bcryptjs';

export const hashPassword = (p: string) => bcrypt.hash(p, 12);
export const verifyPassword = (hash: string, p: string) => bcrypt.compare(p, hash);

