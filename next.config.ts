import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  images: {
    unoptimized: true,
  },
  basePath: '/workflow-dashboard',
  trailingSlash: true,
};

export default nextConfig;
