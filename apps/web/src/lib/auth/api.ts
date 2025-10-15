import { getAccessToken } from './client';

export interface ApiResponse<T = any> {
  data?: T;
  error?: string;
  status: number;
}

export async function apiRequest<T = any>(
  url: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> {
  const token = getAccessToken();
  
  const defaultHeaders: HeadersInit = {
    'Content-Type': 'application/json',
  };

  if (token) {
    defaultHeaders['Authorization'] = `Bearer ${token}`;
  }

  const config: RequestInit = {
    ...options,
    headers: {
      ...defaultHeaders,
      ...options.headers,
    },
    credentials: 'include', // Для refresh токенов
  };

  try {
    const response = await fetch(url, config);

    // Если токен истек, пытаемся обновить его
    if (response.status === 401 && token) {
      console.log('Token expired, attempting refresh...');
      
      const refreshResponse = await fetch('/api/auth/refresh', {
        method: 'POST',
        credentials: 'include',
      });

      if (refreshResponse.ok) {
        const refreshData = await refreshResponse.json();
        console.log('Token refreshed successfully');
        
        // Обновляем токен в localStorage
        localStorage.setItem('access_token', refreshData.accessToken);
        
        // Повторяем запрос с новым токеном
        const retryConfig: RequestInit = {
          ...config,
          headers: {
            ...config.headers,
            'Authorization': `Bearer ${refreshData.accessToken}`,
          },
        };

        const retryResponse = await fetch(url, retryConfig);
        
        if (!retryResponse.ok) {
          console.error('Retry request failed:', retryResponse.status);
          return {
            error: `Retry request failed: ${retryResponse.status}`,
            status: retryResponse.status,
          };
        }
        
        let retryData;
        try {
          retryData = await retryResponse.json();
        } catch (error) {
          console.error('Failed to parse retry response:', error);
          return {
            error: 'Invalid retry response',
            status: retryResponse.status,
          };
        }

        return {
          data: retryData,
          status: retryResponse.status,
        };
      } else {
        console.log('Token refresh failed, redirecting to login');
        // Если обновление не удалось, перенаправляем на логин
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return {
          error: 'Session expired',
          status: 401,
        };
      }
    }

    let data;
    try {
      data = await response.json();
    } catch (error) {
      console.error('Failed to parse JSON response:', error);
      return {
        error: 'Invalid JSON response',
        status: response.status,
      };
    }

    return {
      data,
      status: response.status,
    };
  } catch (error) {
    console.error('API request failed:', error);
    return {
      error: error instanceof Error ? error.message : 'Network error',
      status: 0,
    };
  }
}

// Удобные методы для разных типов запросов
export const api = {
  get: <T = any>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: 'GET' }),
  
  post: <T = any>(url: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: 'POST',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  put: <T = any>(url: string, data?: any, options?: RequestInit) =>
    apiRequest<T>(url, {
      ...options,
      method: 'PUT',
      body: data ? JSON.stringify(data) : undefined,
    }),
  
  delete: <T = any>(url: string, options?: RequestInit) =>
    apiRequest<T>(url, { ...options, method: 'DELETE' }),
};
