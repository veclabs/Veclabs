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
      {
        source: '/demo',
        destination: 'https://demo.veclabs.xyz',
        permanent: false,
      },
      {
        source: '/demo/:path*',
        destination: 'https://demo.veclabs.xyz/:path*',
        permanent: false,
      },
    ]
  },
};

export default nextConfig;
