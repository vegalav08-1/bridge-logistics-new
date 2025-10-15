'use client';

import { useState } from 'react';

export default function TestSimplePage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testDirectApi = async () => {
    setIsTesting(true);
    setTestResult('Testing direct API call...');

    try {
      // Получаем токен из localStorage
      const token = localStorage.getItem('access_token');
      console.log('Token from localStorage:', token ? `${token.substring(0, 50)}...` : 'None');

      if (!token) {
        setTestResult('No token found in localStorage');
        return;
      }

      const response = await fetch('/api/shipments?limit=5', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      console.log('Direct API response status:', response.status);
      console.log('Direct API response headers:', response.headers);

      if (!response.ok) {
        const errorText = await response.text();
        setTestResult(`Error ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Direct API data:', data);

      setTestResult(JSON.stringify(data, null, 2));
    } catch (err: any) {
      console.error('Direct API error:', err);
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testLogin = async () => {
    setIsTesting(true);
    setTestResult('Testing login...');

    try {
      const response = await fetch('/api/auth/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          email: 'admin@example.com',
          password: 'ChangeMe123!',
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        setTestResult(`Login failed ${response.status}: ${errorText}`);
        return;
      }

      const data = await response.json();
      console.log('Login response:', data);

      // Сохраняем токен
      if (data.accessToken) {
        localStorage.setItem('access_token', data.accessToken);
        setTestResult(`Login successful! Token: ${data.accessToken.substring(0, 50)}...`);
      } else {
        setTestResult('Login successful but no token received');
      }
    } catch (err: any) {
      console.error('Login error:', err);
      setTestResult(`Login error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Simple API Test Page</h1>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={testLogin}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={isTesting}
        >
          Test Login
        </button>

        <button
          onClick={testDirectApi}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isTesting}
        >
          Test Direct API
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <h3 className="font-bold mb-2">Result:</h3>
          <pre className="text-sm overflow-auto max-h-96">{testResult}</pre>
        </div>
      )}

      <div className="mt-8">
        <a href="/login" className="text-blue-500 underline">Go to Login</a>
        <span className="mx-2">|</span>
        <a href="/shipments" className="text-blue-500 underline">Go to Shipments</a>
        <span className="mx-2">|</span>
        <a href="/test-api" className="text-blue-500 underline">Go to API Test</a>
      </div>
    </div>
  );
}




