'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';

export default function SetupRichardPage() {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState('');
  const router = useRouter();

  const setupRichard = async () => {
    setIsLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/auth/setup-richard', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const data = await response.json();

      if (response.ok) {
        if (data.exists) {
          setMessage('✅ Account exists! Contact admin for login credentials.');
        } else {
          setMessage('✅ Account created successfully!');
        }
      } else {
        setMessage(`❌ Error: ${data.error}`);
      }
    } catch (error) {
      setMessage(`❌ Error: ${error}`);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="max-w-md w-full space-y-8 p-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold text-white mb-2">Setup Richard Account</h1>
          <p className="text-gray-400 mb-8">
            This will create Richard Boase's super admin account.
          </p>
        </div>

        <div className="bg-gray-900 p-6 rounded-lg border border-gray-800">
          <h2 className="text-lg font-semibold text-white mb-4">Account Details</h2>
          <div className="space-y-2 text-gray-300">
            <p><strong>Email:</strong> [See .env.local]</p>
            <p><strong>Password:</strong> [See .env.local]</p>
            <p><strong>Role:</strong> Super Admin</p>
            <p><strong>Permissions:</strong> Full system access</p>
          </div>
        </div>

        <button
          onClick={setupRichard}
          disabled={isLoading}
          className="w-full bg-sky-600 hover:bg-sky-700 disabled:bg-gray-600 text-white font-bold py-3 px-4 rounded-lg transition-colors"
        >
          {isLoading ? 'Setting up account...' : 'Setup Richard Account'}
        </button>

        {message && (
          <div className={`p-4 rounded-lg ${message.includes('✅') ? 'bg-green-900/50 border border-green-500 text-green-200' :
              'bg-red-900/50 border border-red-500 text-red-200'
            }`}>
            {message}
          </div>
        )}

        <div className="text-center space-y-4">
          <button
            onClick={() => router.push('/login')}
            className="text-sky-400 hover:text-sky-300 underline"
          >
            Go to Login Page
          </button>

          <div className="text-gray-400 text-sm">
            <p>Or use Google OAuth with authorized admin email</p>
          </div>
        </div>
      </div>
    </div>
  );
} 