'use client';

import { useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

// Legacy redirect - paywall is now integrated into home page
function PaywallRedirectContent() {
  const router = useRouter();
  const searchParams = useSearchParams();

  useEffect(() => {
    // Preserve any query params (returnTo, tokenPath, etc.)
    const returnTo = searchParams.get('returnTo');
    const tokenPath = searchParams.get('tokenPath');

    let redirectUrl = '/';
    const params = new URLSearchParams();

    if (returnTo && returnTo !== '/') {
      params.set('returnTo', returnTo);
    }
    if (tokenPath) {
      params.set('tokenPath', tokenPath);
    }

    const queryString = params.toString();
    if (queryString) {
      redirectUrl += '?' + queryString;
    }

    router.replace(redirectUrl);
  }, [router, searchParams]);

  return (
    <div className="min-h-screen bg-black flex items-center justify-center">
      <div className="text-white/50 text-sm">Redirecting...</div>
    </div>
  );
}

export default function PaywallRedirect() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-black flex items-center justify-center">
        <div className="text-white/50 text-sm">Loading...</div>
      </div>
    }>
      <PaywallRedirectContent />
    </Suspense>
  );
}
