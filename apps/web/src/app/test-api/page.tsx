'use client';

import { api } from '@/lib/auth/api';
import { useState } from 'react';

export default function TestApiPage() {
  const [testResult, setTestResult] = useState<string>('');
  const [isTesting, setIsTesting] = useState(false);

  const testShipmentsApi = async () => {
    setIsTesting(true);
    setTestResult('Testing shipments API...');

    try {
      const response = await api.get('/api/shipments?limit=5');
      
      setTestResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  const testAuthMe = async () => {
    setIsTesting(true);
    setTestResult('Testing /api/auth/me...');

    try {
      const response = await api.get('/api/auth/me');
      
      setTestResult(JSON.stringify(response, null, 2));
    } catch (err: any) {
      setTestResult(`Error: ${err.message}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div className="p-8">
      <h1 className="text-2xl font-bold mb-4">API Test Page</h1>
      
      <div className="space-x-4 mb-4">
        <button
          onClick={testShipmentsApi}
          className="px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600 disabled:opacity-50"
          disabled={isTesting}
        >
          Test Shipments API
        </button>

        <button
          onClick={testAuthMe}
          className="px-4 py-2 bg-green-500 text-white rounded hover:bg-green-600 disabled:opacity-50"
          disabled={isTesting}
        >
          Test Auth Me
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
      </div>
    </div>
  );
}




