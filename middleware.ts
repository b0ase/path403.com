import { createServerClient } from '@supabase/ssr'
import { NextResponse, type NextRequest } from 'next/server'
import { isPublicPath } from '@/lib/paywall/config'
import { jwtVerify } from 'jose'

// JWT secret for token access verification
const JWT_SECRET = new TextEncoder().encode(
    process.env.JWT_SECRET || process.env.SUPABASE_SERVICE_ROLE_KEY || 'token-access-secret'
)

// Default prices in satoshis (aligned with blog recommendations)
const SITE_ENTRY_PRICE_SATS = 25; // ~$0.01 - low barrier to entry
const ARTICLE_BASE_PRICE_SATS = 500; // Blog recommendation: 500-2000 sats base

// Token pricing configuration
interface TokenPricing {
    base_price_sats: number; // Base price before decay
    pricing_model: 'fixed' | 'sqrt_decay' | 'linear_decay' | 'auction';
    issuer_share: number; // 0-1 (e.g., 0.5 = 50%)
    platform_share: number;
    content_path: string;
    title?: string;
    description?: string;
    current_supply?: number; // For dynamic pricing (TODO: pull from DB)
}

// Token pricing registry (will be database-driven later)
const TOKEN_PRICING: Record<string, TokenPricing> = {
    '$b0ase.com/blog/metaweb-first-native-consumer': {
        base_price_sats: 500,
        pricing_model: 'sqrt_decay',
        issuer_share: 0.5,
        platform_share: 0.5,
        content_path: '/blog/metaweb-first-native-consumer',
        title: 'MetaWeb: First Native Consumer',
        description: 'The first blog post designed for AI agent consumption via the MetaWeb protocol.',
        current_supply: 0,
    },
    '$b0ase.com/blog/the-maths-of-viral-pricing': {
        base_price_sats: 1000, // Higher value content
        pricing_model: 'sqrt_decay',
        issuer_share: 0.5,
        platform_share: 0.5,
        content_path: '/blog/the-maths-of-viral-pricing',
        title: 'The Maths of Viral Pricing',
        description: 'Mathematical framework for $402 protocol pricing - the canonical pricing reference.',
        current_supply: 0,
    },
    '$BOASE': {
        base_price_sats: SITE_ENTRY_PRICE_SATS,
        pricing_model: 'fixed', // Site entry stays fixed
        issuer_share: 1.0,
        platform_share: 0,
        content_path: '/',
        title: '$BOASE Site Access Token',
        description: 'Entry token for b0ase.com - grants site access and 1 $BOASE reward.',
    },
};

// Calculate current price using sqrt decay: price = base / sqrt(supply + 1)
function calculateCurrentPrice(basePrice: number, model: string, supply: number): number {
    switch (model) {
        case 'sqrt_decay':
            // Price decays as sqrt of supply: early buyers pay more, late buyers less
            // At supply 0: price = base / 1 = base
            // At supply 3: price = base / 2 = base/2
            // At supply 8: price = base / 3 = base/3
            // At supply 99: price = base / 10 = base/10
            return Math.max(10, Math.round(basePrice / Math.sqrt(supply + 1)));
        case 'linear_decay':
            // Linear decay with floor
            return Math.max(10, Math.round(basePrice - (supply * 10)));
        case 'fixed':
        default:
            return basePrice;
    }
}

// Get token pricing with dynamic price calculation
function getTokenPricing(tokenAddress: string): (TokenPricing & { price_sats: number }) | null {
    // Direct lookup
    if (TOKEN_PRICING[tokenAddress]) {
        const config = TOKEN_PRICING[tokenAddress];
        const supply = config.current_supply ?? 0; // TODO: fetch from database
        const price_sats = calculateCurrentPrice(config.base_price_sats, config.pricing_model, supply);
        return { ...config, price_sats };
    }

    // Handle $b0ase.com/* pattern for any content (default pricing)
    if (tokenAddress.startsWith('$b0ase.com/')) {
        const contentPath = tokenAddress.replace('$b0ase.com', '');
        const supply = 0; // TODO: fetch from database
        const price_sats = calculateCurrentPrice(ARTICLE_BASE_PRICE_SATS, 'sqrt_decay', supply);
        return {
            base_price_sats: ARTICLE_BASE_PRICE_SATS,
            price_sats,
            pricing_model: 'sqrt_decay',
            issuer_share: 0.5,
            platform_share: 0.5,
            content_path: contentPath,
            current_supply: supply,
        };
    }

    return null;
}

// Platform payment address
const PLATFORM_HANDCASH_HANDLE = process.env.PLATFORM_HANDCASH_HANDLE || 'b0ase';

// $402 Protocol version
const PROTOCOL_VERSION = '0.1.0';

// Create 402 response for $ token routes (aligned with $402 protocol)
function create402TokenResponse(
    request: NextRequest,
    tokenAddress: string,
    pricing: TokenPricing & { price_sats: number }
): NextResponse {
    const currentSupply = pricing.current_supply ?? 0;

    // $402 protocol response format
    const path402Response = {
        // $402 Protocol fields
        protocol: '$402' as const,
        version: PROTOCOL_VERSION,
        dollarAddress: tokenAddress,
        pricing: {
            model: pricing.pricing_model,
            basePrice: pricing.base_price_sats,
            currency: 'SAT',
        },
        revenue: {
            model: 'fixed_issuer',
            issuerShare: pricing.issuer_share,
        },
        currentSupply: currentSupply,
        currentPrice: pricing.price_sats, // Dynamically calculated
        paymentAddress: PLATFORM_HANDCASH_HANDLE,
        contentType: 'text/html',
        contentPreview: pricing.description || `Content at ${tokenAddress}`,
        children: [], // TODO: Nested content discovery

        // Extended fields for b0ase.com compatibility
        error: 'Payment Required',
        code: 'PAYMENT_REQUIRED',
        token: {
            address: tokenAddress,
            base_price_sats: pricing.base_price_sats,
            price_sats: pricing.price_sats,
            price_usd: pricing.price_sats / 2500,
            supply: currentSupply,
            title: pricing.title,
        },
        payment: {
            currency: 'sats',
            total_sats: pricing.price_sats,
            methods: ['handcash'],
            handcash_address: PLATFORM_HANDCASH_HANDLE,
        },
        endpoints: {
            resolve: `${request.nextUrl.origin}/api/resolve/${encodeURIComponent(tokenAddress)}`,
            pay: `${request.nextUrl.origin}/api/metaweb/pay`,
            verify: `${request.nextUrl.origin}/api/metaweb/verify`,
        },
        content: {
            path: pricing.content_path,
            url: `${request.nextUrl.origin}${pricing.content_path}`,
        },
    };

    const response = new NextResponse(
        JSON.stringify(path402Response),
        { status: 402 }
    );

    // Set $402 protocol headers
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('X-Protocol', '$402');
    response.headers.set('X-Version', PROTOCOL_VERSION);
    response.headers.set('X-Price', pricing.price_sats.toString());
    response.headers.set('X-Base-Price', pricing.base_price_sats.toString());
    response.headers.set('X-Supply', currentSupply.toString());
    response.headers.set('X-Currency', 'SAT');
    response.headers.set('X-Payment-Address', PLATFORM_HANDCASH_HANDLE);
    response.headers.set('X-Token-Address', tokenAddress);
    response.headers.set('X-Pricing-Model', pricing.pricing_model);
    response.headers.set('X-Issuer-Share', pricing.issuer_share.toString());
    response.headers.set('X-Payment-Endpoint', `${request.nextUrl.origin}/api/metaweb/pay`);

    return response;
}

// Verify payment proof JWT for $ routes
interface PaymentProofPayload {
    token_address: string;
    payer_handle: string;
    amount_sats: number;
    tx_hash?: string;
    issued_at: number;
    expires_at: number;
}

async function verifyPaymentProof(proof: string, tokenAddress: string): Promise<PaymentProofPayload | null> {
    try {
        const { payload } = await jwtVerify(proof, JWT_SECRET);
        const data = payload as unknown as PaymentProofPayload;

        // Check expiry
        if (data.expires_at < Date.now()) {
            return null;
        }

        // Check token address matches
        if (data.token_address !== tokenAddress) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

// Check if path is a $ token route
function isTokenRoute(pathname: string): boolean {
    // Matches /$... but not /_next, /api, etc.
    return pathname.startsWith('/$') || pathname.startsWith('/%24');
}

// Parse token address from path
function parseTokenAddress(pathname: string): string {
    // Handle URL-encoded $
    let address = pathname.slice(1); // Remove leading /
    address = decodeURIComponent(address);
    return address;
}

// Check if request is programmatic (API client, MCP agent, etc.)
function isProgrammaticRequest(request: NextRequest): boolean {
    const accept = request.headers.get('accept') || '';
    const userAgent = request.headers.get('user-agent') || '';
    const xRequested = request.headers.get('x-requested-with');

    // Explicit API request
    if (accept.includes('application/json') && !accept.includes('text/html')) {
        return true;
    }

    // MCP or agent request
    if (userAgent.toLowerCase().includes('mcp') || userAgent.toLowerCase().includes('agent')) {
        return true;
    }

    // XMLHttpRequest
    if (xRequested === 'XMLHttpRequest') {
        return true;
    }

    // Custom header for MetaWeb clients
    if (request.headers.get('x-metaweb-client')) {
        return true;
    }

    return false;
}

// Create 402 Payment Required response with MetaWeb headers
function create402Response(
    request: NextRequest,
    tokenAddress: string,
    priceSats: number,
    contentType: string = 'content'
): NextResponse {
    const response = new NextResponse(
        JSON.stringify({
            error: 'Payment Required',
            code: 'PAYMENT_REQUIRED',
            token_address: tokenAddress,
            price_sats: priceSats,
            price_usd: priceSats / 2500,
            currency: 'sats',
            payment_methods: ['handcash', 'bsv'],
            resolve_endpoint: `/api/resolve/${tokenAddress}`,
            payment_endpoint: '/api/metaweb/pay',
            content_type: contentType,
        }),
        { status: 402 }
    );

    // Set MetaWeb headers (X-Payment-* standard)
    response.headers.set('Content-Type', 'application/json');
    response.headers.set('X-Payment-Required', 'true');
    response.headers.set('X-Payment-Amount', priceSats.toString());
    response.headers.set('X-Payment-Currency', 'sats');
    response.headers.set('X-Payment-Address', tokenAddress);
    response.headers.set('X-Payment-Methods', 'handcash,bsv');
    response.headers.set('X-Payment-Endpoint', `${request.nextUrl.origin}/api/metaweb/pay`);
    response.headers.set('X-Payment-Resolve', `${request.nextUrl.origin}/api/resolve/${tokenAddress}`);

    return response;
}

// Token access cookie name
const TOKEN_ACCESS_COOKIE = 'b0ase_token_access'

// Extract subdomain from hostname
function getSubdomain(hostname: string): string | null {
    if (hostname.includes('b0ase.com')) {
        const parts = hostname.split('.');
        if (parts.length > 2 && parts[0] !== 'www') {
            return parts[0];
        }
    }
    if (hostname.includes('localhost')) {
        const parts = hostname.split('.');
        if (parts.length > 1 && !parts[0].includes('localhost')) {
            return parts[0];
        }
    }
    return null;
}

// Check if this is a content path that requires a specific token
function isContentPath(pathname: string): boolean {
    // Blog posts (not the listing)
    if (pathname.startsWith('/blog/') && pathname !== '/blog' && pathname !== '/blog/') {
        return true;
    }
    // Portfolio items (not the listing)
    if (pathname.startsWith('/portfolio/') && pathname !== '/portfolio' && pathname !== '/portfolio/') {
        return true;
    }
    return false;
}

// Paths that only require site-level access (logged in), not per-content tokens
function isSiteAccessPath(pathname: string): boolean {
    const siteAccessPaths = ['/', '/exchange', '/user', '/dashboard', '/blog', '/portfolio'];
    for (const p of siteAccessPaths) {
        if (pathname === p || pathname === p + '/') return true;
        if (p !== '/' && pathname.startsWith(p + '/') && !isContentPath(pathname)) return true;
    }
    return false;
}

// Verify token access JWT and extract owned paths
interface TokenAccessPayload {
    handle: string;
    ownedPaths: string[];
    issuedAt: number;
    expiresAt: number;
}

async function verifyTokenAccessEdge(token: string): Promise<TokenAccessPayload | null> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const data = payload as unknown as TokenAccessPayload;

        if (data.expiresAt < Date.now()) {
            return null;
        }

        return data;
    } catch {
        return null;
    }
}

// Verify site access token (proves they paid entry fee)
interface SiteAccessPayload {
    handle: string;
    paidAt: number;
    expiresAt: number;
}

async function verifySiteAccessEdge(token: string): Promise<boolean> {
    try {
        const { payload } = await jwtVerify(token, JWT_SECRET);
        const data = payload as unknown as SiteAccessPayload;
        return data.expiresAt > Date.now();
    } catch {
        return false;
    }
}

export async function middleware(request: NextRequest) {
    const url = request.nextUrl.clone();
    const hostname = request.headers.get('host') || '';
    const pathname = url.pathname;

    // NOTE: www→non-www redirect should be configured in Vercel dashboard (Domain Settings),
    // not in middleware, to avoid redirect loops with CDN/proxy layers.

    // 1. SUBDOMAIN HANDLING
    const subdomain = getSubdomain(hostname);
    if (subdomain === 'kintsugi') {
        if (pathname === '/' || pathname === '') {
            url.pathname = '/kintsugi';
            return NextResponse.rewrite(url);
        }
        if (pathname === '/developers') {
            url.pathname = '/kintsugi/developers';
            return NextResponse.rewrite(url);
        }
        if (pathname === '/problem') {
            return NextResponse.rewrite(url);
        }
        if (!pathname.startsWith('/api/') && !pathname.startsWith('/kintsugi') && !pathname.startsWith('/_next')) {
            url.pathname = `/kintsugi${pathname}`;
            return NextResponse.rewrite(url);
        }
    }

    // 2. $ TOKEN ROUTES - MetaWeb protocol handling
    if (isTokenRoute(pathname)) {
        const tokenAddress = parseTokenAddress(pathname);
        const pricing = getTokenPricing(tokenAddress);

        if (!pricing) {
            // Unknown token
            return new NextResponse(
                JSON.stringify({
                    error: 'Token Not Found',
                    code: 'TOKEN_NOT_FOUND',
                    token_address: tokenAddress,
                    message: `No token exists at address ${tokenAddress}`,
                }),
                { status: 404, headers: { 'Content-Type': 'application/json' } }
            );
        }

        // Check for payment proof header
        const paymentProof = request.headers.get('X-Payment-Proof') ||
            request.headers.get('Authorization')?.replace('MetaWeb ', '').replace('Bearer ', '');

        if (paymentProof) {
            // Verify the payment proof
            const proofData = await verifyPaymentProof(paymentProof, tokenAddress);

            if (proofData) {
                // Valid proof - rewrite to actual content path
                url.pathname = pricing.content_path;

                // Add headers to pass payment info to the page
                const response = NextResponse.rewrite(url);
                response.headers.set('X-Token-Owner', proofData.payer_handle);
                response.headers.set('X-Token-Address', tokenAddress);
                response.headers.set('X-Token-Paid-Sats', proofData.amount_sats.toString());

                return response;
            }
        }

        // No valid payment proof - return 402
        return create402TokenResponse(request, tokenAddress, pricing);
    }

    // 3. PUBLIC PATHS - No auth needed (except / for programmatic requests)
    if (isPublicPath(pathname)) {
        // Home page: for programmatic requests, still check site access
        if (pathname === '/' && isProgrammaticRequest(request)) {
            const siteAccessToken = request.cookies.get('b0ase_site_access')?.value;
            let hasSiteAccess = false;
            if (siteAccessToken) {
                hasSiteAccess = await verifySiteAccessEdge(siteAccessToken);
            }
            if (!hasSiteAccess) {
                return create402Response(request, '$BOASE', SITE_ENTRY_PRICE_SATS, 'site_entry');
            }
        }
        // Continue to response
    }
    // 3. ACCESS CHECK - Must have PAID to enter site
    else {
        const siteAccessToken = request.cookies.get('b0ase_site_access')?.value;
        const tokenAccessJWT = request.cookies.get(TOKEN_ACCESS_COOKIE)?.value;

        // FIRST: Check site-level access (have they paid entry?)
        let hasSiteAccess = false;
        if (siteAccessToken) {
            hasSiteAccess = await verifySiteAccessEdge(siteAccessToken);
        }

        if (!hasSiteAccess) {
            // No site access - must pay entry fee
            if (isProgrammaticRequest(request)) {
                // Return 402 with payment headers for API/agent requests
                return create402Response(request, '$BOASE', SITE_ENTRY_PRICE_SATS, 'site_entry');
            }
            // Redirect browser to home (which shows paywall UI)
            const homeUrl = new URL('/', request.url);
            homeUrl.searchParams.set('returnTo', pathname);
            return NextResponse.redirect(homeUrl);
        }

        // SECOND: For content paths, also check content token ownership
        if (isContentPath(pathname)) {
            let tokenAccess: TokenAccessPayload | null = null;
            if (tokenAccessJWT) {
                tokenAccess = await verifyTokenAccessEdge(tokenAccessJWT);
            }

            const ownsToken = tokenAccess?.ownedPaths.includes(pathname) ?? false;

            if (!ownsToken) {
                // Has site access but needs to buy this specific content
                if (isProgrammaticRequest(request)) {
                    // Return 402 with payment headers for API/agent requests
                    const tokenAddress = `$b0ase.com${pathname}`;
                    return create402Response(request, tokenAddress, CONTENT_TOKEN_PRICE_SATS, 'content_token');
                }
                // Redirect browser to paywall
                const paywallUrl = new URL('/paywall', request.url);
                paywallUrl.searchParams.set('returnTo', pathname);
                paywallUrl.searchParams.set('tokenPath', pathname);
                return NextResponse.redirect(paywallUrl);
            }
        }
        // Site access paths - already verified above, allow through
    }

    // 4. SUPABASE SESSION MANAGEMENT
    let response = NextResponse.next({
        request: {
            headers: request.headers,
        },
    })

    const supabase = createServerClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
        {
            cookies: {
                getAll() {
                    return request.cookies.getAll()
                },
                setAll(cookiesToSet) {
                    cookiesToSet.forEach(({ name, value }) => {
                        request.cookies.set(name, value)
                    })
                    response = NextResponse.next({
                        request,
                    })
                    cookiesToSet.forEach(({ name, value, options }) => {
                        response.cookies.set(name, value, options)
                    })
                },
            },
        }
    )

    const { data: { user } } = await supabase.auth.getUser()

    // 5. USER ROUTE PROTECTION (Supabase auth OR HandCash auth)
    const isProtectedUserRoute = pathname.startsWith('/user')
    const isAuthRoute = pathname.startsWith('/login') || pathname.startsWith('/register')
    const hasHandcashAuth = !!request.cookies.get('b0ase_handcash_token')?.value

    if (isProtectedUserRoute && !user && !hasHandcashAuth) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/'
        redirectUrl.searchParams.set('redirectedFrom', pathname)
        return NextResponse.redirect(redirectUrl)
    }

    if (isAuthRoute && user) {
        const redirectUrl = request.nextUrl.clone()
        redirectUrl.pathname = '/user/account'
        return NextResponse.redirect(redirectUrl)
    }

    // 6. ADMIN/DASHBOARD PROTECTION
    // Uses Supabase auth (verified user email), NOT unsigned cookies.
    const adminEmail = process.env.ADMIN_EMAIL;
    const adminEmails = adminEmail ? adminEmail.split(',').map(e => e.trim().toLowerCase()) : [];
    const isUserAdmin = user?.email ? adminEmails.includes(user.email.toLowerCase()) : false;
    const isAdminRoute = pathname.startsWith('/admin') || pathname.startsWith('/api/admin');
    const isDashboardRoute = pathname.startsWith('/dashboard');

    if (isDashboardRoute && !isUserAdmin) {
        if (pathname.startsWith('/api/')) {
            return NextResponse.json({ error: 'Dashboard access restricted' }, { status: 403 });
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    if (isAdminRoute && !isUserAdmin) {
        if (pathname.startsWith('/api/admin')) {
            return NextResponse.json({ error: 'Admin access required' }, { status: 401 });
        }
        return NextResponse.redirect(new URL('/', request.url));
    }

    return response
}

export const config = {
    matcher: [
        '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
    ],
}
