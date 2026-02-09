'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { createClient } from '@/lib/supabase/client';

export default function LogoutPage() {
  const router = useRouter();
  const supabase = createClient();

  useEffect(() => {
    const doLogout = async () => {
      // Clear Supabase session
      await supabase.auth.signOut();

      // Clear all cookies
      document.cookie.split(";").forEach((c) => {
        document.cookie = c
          .replace(/^ +/, "")
          .replace(/=.*/, "=;expires=" + new Date().toUTCString() + ";path=/");
      });

      // Clear localStorage
      localStorage.clear();

      // Redirect to paywall (the entry point)
      window.location.href = '/paywall';
    };

    doLogout();
  }, [supabase, router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white font-mono">LOGGING OUT...</div>
    </div>
  );
}
