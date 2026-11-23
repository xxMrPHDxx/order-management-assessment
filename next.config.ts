import path from "node:path";

import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Pin the workspace root so Turbopack ignores unrelated lockfiles above this directory.
  turbopack: {
    root: path.join(__dirname),
  },
  // The PDF renderer must stay in the Node.js runtime bundle rather than be bundled for edge.
  serverExternalPackages: ["@react-pdf/renderer"],
};

export default nextConfig;
