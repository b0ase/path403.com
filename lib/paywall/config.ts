// Paywall configuration
export const PAYWALL_CONFIG = {
    // Price to access the site
    priceUSD: 0.01,

    // Token reward for payment
    tokenReward: 1,
    tokenSymbol: 'BOASE',

    // Cookie name for access token (must match middleware.ts and app/page.tsx)
    accessCookieName: 'b0ase_site_access',

    // Access duration in days
    accessDurationDays: 365,

    // Routes that DON'T require payment (public routes)
    // PAYWALL DISABLED: All main site routes are now public
    publicRoutes: [
        '/_next',
        '/favicon.ico',
        '/robots.txt',
        '/sitemap.xml',
        '/api/paywall',
        '/api/auth',
        '/api/resolve',   // MetaWeb address resolution
        '/api/metaweb',   // MetaWeb payment API
        '/',              // Home page
        '/paywall',       // Legacy - redirects to /
        '/login',         // Login page
        '/logout',        // Logout page
        '/images',
        '/fonts',
        // PAYWALL DISABLED: All main site routes now public
        '/blog',          // Blog listing and posts
        '/portfolio',     // Portfolio listing
        '/exchange',      // Exchange
        '/user',          // User dashboard
        '/dashboard',     // Admin dashboard (still protected by admin check in middleware)
        '/docs',          // Documentation
        '/registry',      // Token registry
        '/token',         // Token page
        '/kintsugi',      // Kintsugi landing
        '/projects',      // Projects page
        '/site-index',    // Site index
        '/buttons',       // Buttons showcase
        '/moneybuttons',  // MoneyButtons
        '/tools',         // Tools
        '/api',           // All API routes (auth handled per-route)
    ],

    // API routes that bypass wallet check (handled internally)
    publicApiRoutes: [
        '/api/paywall/verify',
        '/api/paywall/pay',
        '/api/micropay',
        '/api/auth/handcash',
        '/api/auth/handcash/callback',
        '/api/ai',  // AI API uses its own auth (API keys with micropayments)
    ],
};

// Check if a path is public (doesn't require payment)
export function isPublicPath(pathname: string): boolean {
    // Check exact matches and prefixes
    for (const route of PAYWALL_CONFIG.publicRoutes) {
        if (pathname === route || pathname.startsWith(route + '/') || pathname.startsWith(route)) {
            return true;
        }
    }

    // Check API routes
    for (const route of PAYWALL_CONFIG.publicApiRoutes) {
        if (pathname === route || pathname.startsWith(route)) {
            return true;
        }
    }

    // $ token routes - handled by middleware's token logic
    if (pathname.startsWith('/$') || pathname.startsWith('/%24')) {
        return true;
    }

    // Static files
    if (pathname.match(/\.(js|css|png|jpg|jpeg|gif|svg|ico|woff|woff2|ttf|eot|mp3|mp4|webm|ogg|wav|avif|webp|txt|json)$/)) {
        return true;
    }

    // Music directory
    if (pathname.startsWith('/music/')) {
        return true;
    }

    // OpenGraph images for social sharing (any route ending in /opengraph-image)
    if (pathname.endsWith('/opengraph-image')) {
        return true;
    }

    return false;
}
