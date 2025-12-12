import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'http',
        hostname: '185.146.3.132',
        port: '8080',
        pathname: '/uploads/**',
      },
    ],
  },
};

export default nextConfig;
