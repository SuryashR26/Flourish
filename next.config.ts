import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  // Ensure proper hot reloading
  webpack: (config, { dev, isServer }) => {
    if (dev && !isServer) {
      config.optimization.moduleIds = 'named';
      // Add additional webpack configuration for better HMR
      config.watchOptions = {
        poll: 1000, // Check for changes every second
        aggregateTimeout: 300, // Delay before rebuilding
      };
    }
    return config;
  },
};

export default nextConfig;
