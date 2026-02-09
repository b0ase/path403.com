'use client';

import { useState, useEffect } from 'react';
import { createClient } from '@supabase/supabase-js';
import { useRouter } from 'next/navigation'; // Use next/navigation

// Initialize Supabase client (ensure env vars are set)
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

if (!supabaseUrl || !supabaseAnonKey) {
  console.error('Supabase URL or Anon Key is missing in client environment variables.');
  // Handle this appropriately - maybe show an error message
}

const supabase = createClient(supabaseUrl!, supabaseAnonKey!);

export default function SetPasswordPage() {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const router = useRouter();

  useEffect(() => {
    // Check if the user is logged in (via the magic link)
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      
      if (sessionError) {
        console.error("Error fetching session:", sessionError);
        setError("Could not verify your session. Please try the link again.");
        return;
      }

      if (!session) {
        setError('No active session found. This link might have expired or already been used. Please request a new invitation if needed.');
        // Optionally redirect to login after a delay
        // setTimeout(() => router.push('/login'), 5000);
      } else {
        setUserEmail(session.user.email || 'your account');
        console.log('User authenticated via magic link:', session.user.email);
        setMessage('Welcome! Please set your password to activate your account.');
      }
    };
    checkSession();
  }, [router]);

  const handlePasswordSet = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setMessage(null);

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }
    if (password.length < 6) { // Example: Enforce minimum password length
        setError('Password must be at least 6 characters long.');
        return;
    }

    setLoading(true);

    const { error: updateError } = await supabase.auth.updateUser({
      password: password,
    });

    setLoading(false);

    if (updateError) {
      console.error('Error setting password:', updateError);
      setError(`Failed to set password: ${updateError.message}`);
    } else {
      setMessage('Password successfully set! Redirecting to your dashboard...');
      // Redirect to the user's project page or dashboard after success
      setTimeout(() => router.push('/dashboard'), 2000); // Adjust redirect path as needed
    }
  };

  return (
    <div className="container mx-auto px-4 py-8 max-w-md">
      <h1 className="text-3xl font-bold mb-6 text-center">Set Your Password</h1>

      {userEmail ? (
        <form onSubmit={handlePasswordSet} className="space-y-4">
          <p className="text-center text-gray-300 mb-4">Set a password for {userEmail}.</p>
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-300 mb-1">
              New Password
            </label>
            <input
              id="password"
              name="password"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>
          <div>
            <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-300 mb-1">
              Confirm New Password
            </label>
            <input
              id="confirmPassword"
              name="confirmPassword"
              type="password"
              required
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
            />
          </div>

          {error && <p className="text-red-500 text-sm text-center">{error}</p>}
          {message && <p className="text-green-500 text-sm text-center">{message}</p>}

          <button
            type="submit"
            disabled={loading}
            className="w-full py-2 px-4 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-md transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {loading ? 'Setting Password...' : 'Set Password & Login'}
          </button>
        </form>
      ) : (
        // Show loading state or initial error message while checking session
        <div>
             {error && <p className="text-red-500 text-sm text-center">{error}</p>}
             {!error && <p className="text-gray-400 text-center">Verifying invitation...</p>} 
        </div>
       
      )}
    </div>
  );
} 