import path from "node:path";
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: {
    // This checkout is a git worktree nested under the main repo, which has
    // its own lockfile a few directories up. Pin the root explicitly so
    // Turbopack doesn't infer the wrong workspace root.
    root: path.resolve(__dirname),
  },
  output: "standalone",
  async redirects() {
    return [
      {
        source: "/graduation/guest",
        destination: "/admin/graduation/guest",
        permanent: false,
      },
      {
        source: "/graduation/settings",
        destination: "/admin/graduation/settings",
        permanent: false,
      },
      {
        source: "/graduation/images",
        destination: "/admin/graduation/images",
        permanent: false,
      },
      {
        source: "/admin/graduation/media",
        destination: "/admin/graduation/images",
        permanent: false,
      },
      {
        source: "/admin/graduation",
        destination: "/admin/graduation/guest",
        permanent: false,
      },
    ];
  },
  images: {
    qualities: [75, 90],
    localPatterns: [
      // Uploaded graduation photos are proxied with the blob pathname in the query string.
      { pathname: "/api/graduation/image" },
      { pathname: "/**", search: "" },
    ],
  },
};

export default nextConfig;
