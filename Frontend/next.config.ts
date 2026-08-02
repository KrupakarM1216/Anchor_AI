import type { NextConfig } from "next";
import { join } from "node:path";

const nextConfig: NextConfig = {
  // Dependencies are hoisted to the repository root by npm workspaces.
  turbopack: { root: join(__dirname, "..") },
};

export default nextConfig;
