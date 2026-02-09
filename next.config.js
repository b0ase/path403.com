/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,

  // Security headers for all routes
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on'
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload'
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN'
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin'
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()'
          },
        ],
      },
    ];
  },
  async redirects() {
    return [
      {
        source: '/blog/kintsugi-repair-pledge',
        destination: '/blog/kintsugi-contracts',
        permanent: true,
      },
    ];
  },
  async rewrites() {
    return [
      {
        // Serve raw markdown files at /blog/[slug].md
        source: '/blog/:slug.md',
        destination: '/api/blog/:slug/md',
      },
    ];
  },

  typescript: {
    // TODO: Fix TypeScript errors and enable strict checking
    // Currently 65+ errors need to be fixed incrementally
    // See tsconfig.strict.json for gradual migration path
    ignoreBuildErrors: true, // Will remove after fixing errors
  },
  experimental: {
    outputFileTracingIncludes: {
      '/blog/[slug]/opengraph-image': ['./og-assets/**/*'],
    },
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: 'api.b0ase.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'www.kindpng.com',
      },
    ],
    formats: ['image/webp', 'image/avif'],
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60,
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
  },
  turbopack: {},
  webpack: (config, { dev, isServer }) => {
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Enhanced bundle optimization
    config.optimization = {
      ...config.optimization,
      splitChunks: {
        chunks: 'all',
        cacheGroups: {
          default: {
            minChunks: 2,
            priority: -20,
            reuseExistingChunk: true,
          },
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            priority: -10,
            chunks: 'all',
          },
          // Separate Three.js into its own chunk
          three: {
            test: /[\\/]node_modules[\\/](three|@react-three)[\\/]/,
            name: 'three-vendor',
            priority: 10,
            chunks: 'all',
          },
          // Separate Supabase into its own chunk
          supabase: {
            test: /[\\/]node_modules[\\/]@supabase[\\/]/,
            name: 'supabase-vendor',
            priority: 10,
            chunks: 'all',
          },
          // Separate large libraries
          common: {
            test: /[\\/]node_modules[\\/](framer-motion|gsap|leva)[\\/]/,
            name: 'common-vendor',
            priority: 5,
            chunks: 'all',
          },
        },
      },
    };

    // Enable WebAssembly support
    config.experiments = {
      ...config.experiments,
      asyncWebAssembly: true,
      layers: true,
    };

    return config;
  },
  serverExternalPackages: ['bsv-wasm'],
};

module.exports = nextConfig;
