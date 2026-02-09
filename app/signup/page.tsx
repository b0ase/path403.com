'use client';

import { useAuth } from '@/components/Providers';
import SimpleAuth from '@/components/SimpleAuth';
import { useRouter } from 'next/navigation';
import { useEffect, Suspense } from 'react';
import { UserPlus, ArrowRight, Shield } from 'lucide-react';

function SignupContent() {
  const { isAuthenticated, loading } = useAuth();
  const router = useRouter();

  // Redirect if already authenticated
  useEffect(() => {
    if (!loading && isAuthenticated) {
       // We can't strictly check admin status here easily without blinking, 
       // but typically already-signed-in users going to /signup should probably go to dashboard or account
       router.push('/user/account'); 
    }
  }, [isAuthenticated, loading, router]);

  const handleAuthSuccess = async () => {
     // Similar logic to login - determine where to send them
     // Dynamic import to avoid SSR issues if any
     const { createClient } = await import('@/lib/supabase/client');
     const supabase = createClient();
     const { data: { user } } = await supabase.auth.getUser();
     
     if (user?.email === 'admin@b0ase.com') {
       router.push('/dashboard');
     } else {
       router.push('/user/account');
     }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-black text-white font-mono flex items-center justify-center">
        <div className="text-center p-12 border border-zinc-900 bg-zinc-950 max-w-sm w-full mx-4">
          <div className="w-8 h-8 border-2 border-zinc-800 border-t-white animate-spin mx-auto mb-6"></div>
          <p className="text-zinc-500 text-[10px] font-bold uppercase tracking-[0.3em]">Initializing Registration Protocol...</p>
        </div>
      </div>
    );
  }

  if (isAuthenticated) {
    return null;
  }

  return (
    <div className="min-h-screen bg-black text-white font-mono selection:bg-white selection:text-black flex items-center justify-center p-4">
        {/* Background Grid/Effects */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#111_1px,transparent_1px),linear-gradient(to_bottom,#111_1px,transparent_1px)] bg-[size:40px_40px] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)] pointer-events-none"></div>

        <div className="w-full max-w-lg relative z-10">
            {/* Header */}
            <div className="text-center mb-12">
                <div className="inline-flex items-center justify-center w-16 h-16 bg-zinc-900 rounded-2xl mb-6 border border-zinc-800 shadow-[0_0_30px_rgba(255,255,255,0.05)]">
                    <UserPlus className="w-8 h-8 text-white" />
                </div>
                <h1 className="text-4xl md:text-5xl font-black uppercase tracking-tighter mb-4">
                    Join Network
                </h1>
                <p className="text-zinc-500 text-xs font-bold uppercase tracking-[0.2em] max-w-sm mx-auto leading-relaxed">
                    Initialize your operative identity within the b0ase ecosystem.
                </p>
            </div>

            {/* Auth Container */}
            <div className="bg-zinc-950 border border-zinc-900 p-8 md:p-12 shadow-2xl relative overflow-hidden group">
                <div className="absolute top-0 right-0 p-4 opacity-0 group-hover:opacity-10 transition-opacity">
                    <Shield className="w-24 h-24" />
                </div>

                <SimpleAuth 
                    mode="signup"
                    onSuccess={handleAuthSuccess}
                    onError={(error) => console.error('Signup error:', error)}
                />

                {/* Footer Links */}
                <div className="mt-8 pt-8 border-t border-zinc-900 flex flex-col items-center gap-4">
                    <p className="text-zinc-600 text-[10px] font-bold uppercase tracking-widest">
                        Already have an identity?
                    </p>
                    <button 
                        onClick={() => router.push('/login')}
                        className="flex items-center gap-2 text-white hover:text-zinc-300 transition-colors text-xs font-bold uppercase tracking-widest group"
                    >
                        Authenticate Session <ArrowRight className="w-3 h-3 group-hover:translate-x-1 transition-transform" />
                    </button>
                </div>
            </div>

            {/* Status Indicators */}
            <div className="mt-12 grid grid-cols-2 gap-4">
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 text-center">
                    <span className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Encryption</span>
                    <span className="text-[10px] font-bold text-green-500 uppercase tracking-widest">Active</span>
                </div>
                <div className="bg-zinc-900/50 border border-zinc-900 p-4 text-center">
                     <span className="block text-[9px] font-bold text-zinc-600 uppercase tracking-widest mb-1">Registration</span>
                     <span className="text-[10px] font-bold text-white uppercase tracking-widest">Open</span>
                </div>
            </div>
        </div>
    </div>
  );
}

export default function SignupPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center font-mono">
        <div className="text-zinc-700 text-[10px] font-bold uppercase tracking-[0.4em] animate-pulse">Loading Interface...</div>
      </div>
    }>
      <SignupContent />
    </Suspense>
  );
}