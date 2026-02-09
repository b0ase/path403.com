import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/',
        destination: '/401',
        has: [{ type: 'host', value: '(?:www\\.)?path401\\.com' }],
      },
      {
        source: '/',
        destination: '/403',
        has: [{ type: 'host', value: '(?:www\\.)?path403\\.com' }],
      },
    ];
  },
};

export default nextConfig;
