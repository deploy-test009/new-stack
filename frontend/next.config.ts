import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  output: 'standalone', // makes the Docker image small later
};

export default nextConfig;
