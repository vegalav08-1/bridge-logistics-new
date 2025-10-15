import { NextRequest, NextResponse } from 'next/server';

export async function GET(request: NextRequest) {
  // Перенаправление на страницу входа с очисткой cookies
  const response = NextResponse.redirect(new URL('/login', request.url));
  
  // Очищаем все cookies
  response.cookies.delete('rt');
  response.cookies.delete('user-role');
  
  return response;
}

export async function POST(request: NextRequest) {
  // Перенаправляем на существующий logout endpoint
  const response = NextResponse.redirect(new URL('/api/auth/logout', request.url));
  return response;
}
