import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Keep Turbopack scoped to this repository when a parent workspace has a lockfile.
  turbopack: {
    root: process.cwd(),
  },
};

export default nextConfig;
