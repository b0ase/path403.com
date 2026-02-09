'use client';

import { useState, useEffect } from 'react';

export function useUserHandle() {
    const [handle, setHandle] = useState<string | null>(null);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        // Only access browser APIs after client hydration
        if (typeof window !== 'undefined') {
            const match = document.cookie.match(new RegExp('(^| )b0ase_user_handle=([^;]+)'));
            if (match) setHandle(match[2]);
            // Mark as client-side rendered after processing
            setIsClient(true);
        }
    }, []);

    return { handle, isClient };
}
