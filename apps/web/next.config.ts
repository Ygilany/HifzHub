import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['bcrypt', 'pg'],
  // Empty turbopack config to silence the warning
  // Turbopack handles native modules better than webpack
  turbopack: {},
};

export default nextConfig;
