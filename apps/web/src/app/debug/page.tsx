'use client';

import { useAuth } from '@/lib/auth/client';
import { api } from '@/lib/auth/api';
import { useState, useEffect } from 'react';

export default function DebugPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [apiTest, setApiTest] = useState<any>(null);
  const [loading, setLoading] = useState(false);

  const testApi = async () => {
    setLoading(true);
    try {
      const response = await api.get('/api/shipments');
      setApiTest(response);
    } catch (error) {
      setApiTest({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <main className="mx-auto max-w-4xl px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Debug Page</h1>
      
      <div className="space-y-4">
        <div className="p-4 border rounded">
          <h2 className="font-bold">Auth State</h2>
          <p>Loading: {isLoading ? 'Yes' : 'No'}</p>
          <p>Authenticated: {isAuthenticated ? 'Yes' : 'No'}</p>
          <p>Token: {token ? `${token.substring(0, 20)}...` : 'None'}</p>
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">API Test</h2>
          <button 
            onClick={testApi}
            disabled={loading}
            className="px-4 py-2 bg-blue-500 text-white rounded disabled:opacity-50"
          >
            {loading ? 'Testing...' : 'Test API'}
          </button>
          {apiTest && (
            <pre className="mt-2 p-2 bg-gray-100 rounded text-sm overflow-auto">
              {JSON.stringify(apiTest, null, 2)}
            </pre>
          )}
        </div>

        <div className="p-4 border rounded">
          <h2 className="font-bold">Local Storage</h2>
          <p>Access Token: {typeof window !== 'undefined' ? localStorage.getItem('access_token')?.substring(0, 20) + '...' : 'N/A'}</p>
        </div>
      </div>
    </main>
  );
}




