import type { NextConfig } from "next";

const backendUrl = process.env.BACKEND_URL || 'http://localhost:8080';

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${backendUrl}/api/:path*`,
      },
    ];
  },
  images: {
    // Allow local images and belt images from Vercel deployment
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'dad-coach-web.vercel.app',
        pathname: '/belts/**',
      },
    ],
    // Ensure local images work correctly
    unoptimized: process.env.NODE_ENV === 'development',
  },
};

export default nextConfig;
