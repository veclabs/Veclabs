import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  async redirects() {
    return [
      {
        source: '/docs',
        destination: 'https://veclabs-veclabs.mintlify.app/introduction',
        permanent: false,
      },
      {
        source: '/docs/:path*',
        destination: 'https://veclabs-veclabs.mintlify.app/:path*',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
