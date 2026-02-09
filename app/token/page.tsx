'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function TokenRedirect() {
  const router = useRouter();

  useEffect(() => {
    router.replace('/boase');
  }, [router]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-gray-500 font-mono text-xs uppercase tracking-widest animate-pulse">
        Redirecting to $BOASE Studio Asset...
      </div>
    </div>
  );
}