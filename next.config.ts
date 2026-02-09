import type { NextConfig } from "next";

const siteVariant = process.env.NEXT_PUBLIC_SITE_VARIANT || '402';

const nextConfig: NextConfig = {
  async redirects() {
    // On variant sites, redirect / → /{variant}
    if (siteVariant !== '402') {
      return [
        {
          source: '/',
          destination: `/${siteVariant}`,
          permanent: false,
        },
      ];
    }
    return [];
  },
};

export default nextConfig;
