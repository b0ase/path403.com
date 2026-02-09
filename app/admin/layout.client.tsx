'use client';

import getSupabaseBrowserClient from '@/lib/supabase/client';
import { FaSignOutAlt } from 'react-icons/fa';

export default function AdminLayoutClient({
  children,
}: {
  children: React.ReactNode;
}) {
  const supabase = getSupabaseBrowserClient();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    window.location.href = '/admin/login';
  };

  return (
    <div className="min-h-screen bg-gray-950">
      <div className="fixed top-4 right-4 z-50">
        <button
          onClick={handleLogout}
          className="flex items-center gap-2 bg-red-700 hover:bg-red-600 text-white px-4 py-2 rounded-lg shadow-lg transition-colors"
        >
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
      {children}
    </div>
  );
}
