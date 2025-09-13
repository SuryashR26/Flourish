import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  images: {
    domains: [], // Add external domains if needed
  },
  // Improved hot reloading configuration
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      // Optimize for faster rebuilds
      config.optimization.moduleIds = 'named';
      config.optimization.chunkIds = 'named';
      
      // Faster file watching
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 200, // Reduced from 300
        ignored: ['**/node_modules', '**/.git', '**/.next'],
      };
    }
    return config;
  },
  // Enable experimental features for better performance
  experimental: {
    optimizePackageImports: ['lucide-react', 'react-icons'],
  },
};

export default nextConfig;
