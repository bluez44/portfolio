import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // This checkout is a git worktree nested under the main repo, which has
    // its own lockfile a few directories up. Pin the root explicitly so
    // Turbopack doesn't infer the wrong workspace root.
    root: path.resolve(__dirname),
  },
};

export default nextConfig;
