"use client";
import React, { useState, useEffect } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';

export default function CalendarAuthPage() {
  const router = useRouter();
  const [isAuthenticating, setIsAuthenticating] = useState(false);
  const [authStatus, setAuthStatus] = useState<null | 'success' | 'error'>(null);
  const [errorMessage, setErrorMessage] = useState('');

  // In a real implementation, you would check for an existing session here
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Simulate checking auth status
    const checkAuthStatus = () => {
      // This would be replaced with actual auth check logic
      const hasSession = localStorage.getItem('googleAuthSession');
      if (hasSession) {
        setIsAuthenticated(true);
      }
    };

    checkAuthStatus();
  }, []);

  const handleGoogleSignIn = () => {
    setIsAuthenticating(true);
    setAuthStatus(null);

    // In a real implementation, this would redirect to Google OAuth
    // For simulation purposes, we'll use a timeout
    setTimeout(() => {
      // Simulate successful authentication
      localStorage.setItem('googleAuthSession', 'true');
      setIsAuthenticated(true);
      setIsAuthenticating(false);
      setAuthStatus('success');
    }, 1500);
  };

  const handleSignOut = () => {
    // In a real implementation, this would clear the session
    localStorage.removeItem('googleAuthSession');
    setIsAuthenticated(false);
  };

  const handleContinue = () => {
    router.push('/gigs/calendar');
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Link href="/gigs/calendar" className="text-blue-400 hover:text-blue-300 flex items-center gap-2">
          <span>←</span> Back to Calendar
        </Link>
      </div>
      
      <h1 className="text-3xl font-bold mb-6">Calendar Authentication</h1>
      
      <div className="max-w-md mx-auto bg-gray-850 border border-gray-700 rounded-lg p-6 shadow-lg">
        <h2 className="text-xl font-semibold mb-4 text-white">Google Calendar Integration</h2>
        
        <p className="text-gray-400 mb-6">
          Connect your Google account to synchronize events between B0ASE Calendar and Google Calendar.
          This will allow you to manage events from either platform.
        </p>
        
        {isAuthenticated ? (
          <div>
            <div className="flex items-center gap-3 p-3 bg-green-900/20 border border-green-500/30 rounded-md mb-6">
              <div className="text-green-400 text-xl">✓</div>
              <div>
                <p className="text-green-400 font-medium">Connected to Google</p>
                <p className="text-gray-400 text-sm">Your calendar is ready to sync</p>
              </div>
            </div>
            
            <div className="flex flex-col gap-3">
              <button
                onClick={handleContinue}
                className="w-full py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md font-medium transition-colors"
              >
                Continue to Calendar
              </button>
              
              <button
                onClick={handleSignOut}
                className="w-full py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-md font-medium transition-colors"
              >
                Sign Out
              </button>
            </div>
          </div>
        ) : (
          <div>
            <button
              onClick={handleGoogleSignIn}
              disabled={isAuthenticating}
              className="w-full flex items-center justify-center gap-2 py-2 bg-white hover:bg-gray-100 text-gray-800 rounded-md font-medium transition-colors disabled:opacity-70"
            >
              {isAuthenticating ? (
                <>
                  <span className="animate-spin text-sm">⟳</span>
                  Authenticating...
                </>
              ) : (
                <>
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path
                      fill="#4285F4"
                      d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    />
                    <path
                      fill="#34A853"
                      d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    />
                    <path
                      fill="#FBBC05"
                      d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    />
                    <path
                      fill="#EA4335"
                      d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    />
                    <path fill="none" d="M1 1h22v22H1z" />
                  </svg>
                  Sign in with Google
                </>
              )}
            </button>
            
            {authStatus === 'error' && (
              <div className="mt-4 p-3 bg-red-900/20 border border-red-500/30 rounded-md text-red-400 text-sm">
                {errorMessage || 'An error occurred during authentication. Please try again.'}
              </div>
            )}
            
            <div className="mt-6 border-t border-gray-700 pt-6">
              <h3 className="text-sm font-medium text-gray-300 mb-2">Permissions Required:</h3>
              <ul className="list-disc list-inside text-xs text-gray-400 space-y-1">
                <li>View your Google Calendar events</li>
                <li>Create and edit events on your calendars</li>
                <li>Access to your name and email address</li>
              </ul>
              <p className="text-xs text-gray-500 mt-3">
                We only request the minimum permissions needed for calendar synchronization.
                Your data is never shared with third parties.
              </p>
            </div>
          </div>
        )}
      </div>
      
      <div className="max-w-md mx-auto mt-6 p-4 border border-gray-700 rounded-lg bg-gray-850">
        <h3 className="text-lg font-semibold mb-2 text-white">What you can do after connecting:</h3>
        <ul className="list-disc list-inside text-sm text-gray-400 space-y-2">
          <li>Sync B0ASE events to your Google Calendar</li>
          <li>Import existing Google Calendar events</li>
          <li>Receive notifications for events on all devices</li>
          <li>Manage events from either platform</li>
        </ul>
      </div>
    </div>
  );
} 