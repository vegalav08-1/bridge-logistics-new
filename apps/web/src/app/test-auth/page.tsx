'use client';

import { useAuth } from '@/lib/auth/client';
import { useState } from 'react';

export default function TestAuthPage() {
  const { token, isAuthenticated, isLoading } = useAuth();
  const [testResult, setTestResult] = useState<string>('');

  const testChatAccess = async () => {
    if (!token) {
      setTestResult('No token available');
      return;
    }

    try {
      const res = await fetch('/api/shipments/cmgiroqwp000h7h09fdspcvuc', {
        headers: {
          'Authorization': `Bearer ${token}`,
        },
      });

      if (res.ok) {
        const data = await res.json();
        setTestResult(`Success! Chat: ${data.number} (${data.type})`);
      } else {
        setTestResult(`Error: ${res.status} ${res.statusText}`);
      }
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    }
  };

  if (isLoading) {
    return <div>Loading...</div>;
  }

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">Auth Test Page</h1>
      
      <div className="mb-4">
        <p><strong>Authenticated:</strong> {isAuthenticated ? 'Yes' : 'No'}</p>
        <p><strong>Token:</strong> {token ? `${token.substring(0, 50)}...` : 'None'}</p>
      </div>

      <button
        onClick={testChatAccess}
        className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
        disabled={!isAuthenticated}
      >
        Test Chat Access
      </button>

      {testResult && (
        <div className="mt-4 p-4 bg-gray-100 rounded">
          <strong>Result:</strong> {testResult}
        </div>
      )}

      <div className="mt-8">
        <a href="/login" className="text-blue-500 underline">Go to Login</a>
      </div>
    </div>
  );
}


