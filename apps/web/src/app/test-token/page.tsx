'use client';

import { useAuth } from '@/lib/auth/client';
import { api } from '@/lib/auth/api';
import { useState } from 'react';

export default function TestTokenPage() {
  const { token, isAuthenticated, isLoading, refreshToken } = useAuth();
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testApiCall = async () => {
    if (!isAuthenticated) {
      setTestResult('Not authenticated');
      return;
    }

    setIsTesting(true);
    setTestResult('Testing...');

    try {
      const response = await api.get('/api/shipments?limit=1');
      
      if (response.error) {
        setTestResult(`Error: ${response.error}`);
      } else {
        setTestResult(`Success! Found ${response.data?.items?.length || 0} shipments`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testTokenRefresh = async () => {
    setIsTesting(true);
    setTestResult('Refreshing token...');

    try {
      const success = await refreshToken();
      setTestResult(success ? 'Token refreshed successfully!' : 'Token refresh failed');
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  if (isLoading) {
    return <div className="p-8">Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Token Test Page</h1>
      
      <div className="mb-4">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 50)}...` : 'None'}</p>
      </div>

      <div className="space-x-4 mb-4">
        <button
          onClick={testApiCall}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={!isAuthenticated || isTesting}
        >
          Test API Call
        </button>

        <button
          onClick={testTokenRefresh}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={isTesting}
        >
          Test Token Refresh
        </button>
      </div>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Result:</strong> {testResult}
        </div>
      )}

      <div className="mt-8">
        <a href="/login" className="text-blue-500 underline">Go to Login</a>
        <span className="mx-2">|</span>
        <a href="/shipments" className="text-blue-500 underline">Go to Shipments</a>
      </div>
    </div>
  );
}




