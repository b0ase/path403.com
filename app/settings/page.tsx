'use client';

import React, { useState, FormEvent, useEffect } from 'react';
import getSupabaseBrowserClient from '@/lib/supabase/client';

export default function SettingsPage() {
  const supabase = getSupabaseBrowserClient();

  // State for email display
  const [userEmail, setUserEmail] = useState<string | undefined>(undefined);

  // State for password change form
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');
  const [message, setMessage] = useState('');
  const [error, setError] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);

  useEffect(() => {
    const fetchEmail = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      if (session?.user?.email) {
        setUserEmail(session.user.email);
      }
    };
    fetchEmail();
  }, [supabase]);

  const handlePasswordUpdate = async (e: FormEvent) => {
    e.preventDefault();
    setIsUpdating(true);
    setMessage('');
    setError('');

    if (newPassword !== confirmNewPassword) {
      setError("New passwords do not match.");
      setIsUpdating(false);
      return;
    }

    if (newPassword.length < 6) { // Example: Supabase default minimum password length
      setError("New password must be at least 6 characters long.");
      setIsUpdating(false);
      return;
    }

    const { error: updateError } = await supabase.auth.updateUser({
      password: newPassword,
    });

    if (updateError) {
      if (updateError.message.includes("requires a recent login") || updateError.message.includes("For security purposes, you need to re-authenticate")) {
        setError("For security reasons, you might need to log out and log back in before changing your password, or this operation requires a more recent login.");
      } else if (updateError.message.includes("same as the existing password")) {
        setError("The new password cannot be the same as your current password.");
      } else {
        setError(`Failed to update password: ${updateError.message}`);
      }
    } else {
      setMessage("Password updated successfully!");
      setNewPassword('');
      setConfirmNewPassword('');
    }
    setIsUpdating(false);
  };

  return (
    <div className="p-4 md:p-8">
      <div className="max-w-2xl mx-auto bg-slate-800 shadow-xl rounded-lg p-6 md:p-8">
        <div className="space-y-8">
          {/* Account Settings Section with Change Password Form */}
          <section>
            <h2 className="text-xl font-semibold text-sky-300 mb-3">Account</h2>
            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600 space-y-6">
              <div>
                <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email Address</label>
                <input 
                  type="email" 
                  name="email" 
                  id="email" 
                  disabled 
                  value={userEmail || ''}
                  placeholder="Loading email..."
                  className="mt-1 block w-full bg-slate-600 border-slate-500 rounded-md shadow-sm py-2 px-3 text-gray-400 focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm cursor-not-allowed" 
                />
                 <p className="text-xs text-gray-400 mt-1">Email addresses can be changed via a confirmation link sent to the new email.</p>
              </div>

              <form onSubmit={handlePasswordUpdate} className="space-y-4">
                <div>
                  <label htmlFor="newPassword" className="block text-sm font-medium text-gray-300">New Password</label>
                  <input
                    type="password"
                    name="newPassword"
                    id="newPassword"
                    value={newPassword}
                    onChange={(e) => setNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="mt-1 block w-full bg-slate-700 border-slate-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>
                <div>
                  <label htmlFor="confirmNewPassword" className="block text-sm font-medium text-gray-300">Confirm New Password</label>
                  <input
                    type="password"
                    name="confirmNewPassword"
                    id="confirmNewPassword"
                    value={confirmNewPassword}
                    onChange={(e) => setConfirmNewPassword(e.target.value)}
                    required
                    autoComplete="new-password"
                    className="mt-1 block w-full bg-slate-700 border-slate-500 rounded-md shadow-sm py-2 px-3 text-white focus:outline-none focus:ring-sky-500 focus:border-sky-500 sm:text-sm"
                  />
                </div>
                <button 
                  type="submit"
                  disabled={isUpdating}
                  className="w-full inline-flex justify-center items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 disabled:opacity-50"
                >
                  {isUpdating ? 'Updating...' : 'Update Password'}
                </button>
                {message && <p className="text-sm text-green-400">{message}</p>}
                {error && <p className="text-sm text-red-400">{error}</p>}
              </form>
            </div>
          </section>

          {/* Placeholder for Profile Settings */}
          <section>
            <h2 className="text-xl font-semibold text-sky-300 mb-3">Profile Customization</h2>
            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
              <p className="text-gray-300">Update your public profile information, avatar, and social links.</p>
               <button 
                  type="button"
                  disabled
                  className="mt-4 inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 focus:ring-offset-slate-800 cursor-not-allowed opacity-70"
                >
                  Edit Profile (Coming Soon)
                </button>
            </div>
          </section>

          {/* Placeholder for Notification Settings */}
          <section>
            <h2 className="text-xl font-semibold text-sky-300 mb-3">Notifications</h2>
            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
              <p className="text-gray-300">Configure your notification preferences for projects, tasks, and messages.</p>
            </div>
          </section>

          {/* Placeholder for Theme/Appearance Settings */}
          <section>
            <h2 className="text-xl font-semibold text-sky-300 mb-3">Appearance</h2>
            <div className="bg-slate-700/50 p-4 rounded-md border border-slate-600">
              <p className="text-gray-300">Choose your preferred theme (Light/Dark) and other display settings.</p>
            </div>
          </section>
        </div>

        <div className="mt-10 pt-6 border-t border-slate-700 text-center">
          <p className="text-sm text-gray-500">More settings will be available soon.</p>
        </div>
      </div>
    </div>
  );
} 