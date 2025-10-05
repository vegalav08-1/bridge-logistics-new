// Лёгкая оболочка для чтения env на ранних спринтах
export const env = {
  NODE_ENV: process.env.NODE_ENV ?? 'development',
  // Добавим остальные по мере внедрения модулей
};
