import type { NextConfig } from "next";

// Use static export only during GitHub Actions CI (for GitHub Pages deployment)
// During local dev, skip 'output: export' so middleware works correctly
const isCI = process.env.CI === 'true';

const nextConfig: NextConfig = {
  ...(isCI ? { output: 'export' } : {}),
  images: {
    unoptimized: true,
  },
  basePath: '/workflow-dashboard',
  trailingSlash: true,
};

export default nextConfig;
