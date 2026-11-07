import type { NextConfig } from "next";

/**
 * Where the Spring backend runs. Read at BUILD time (rewrites are baked into the build).
 *  - local dev:  http://localhost:8080 (default)
 *  - Docker:     http://nekoqr-backend:8080  (passed as a build arg, see Dockerfile / compose.yaml)
 */
const API_URL = (process.env.NEKOQR_API_URL ?? "http://localhost:8080").replace(/\/$/, "");

const nextConfig: NextConfig = {
  /* config options here */
  output: "standalone", // small self-contained server for Docker (.next/standalone)
  cacheComponents: true,
  partialPrefetching: true,
  reactCompiler: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
  async rewrites() {
    return {
      beforeFiles: [],
      // API calls → backend (no CORS needed, backend never exposed publicly)
      afterFiles: [
        {
          source: "/api/v1/:path*",
          destination: `${API_URL}/api/v1/:path*`,
        },
      ],
      // Any single path that isn't a page (e.g. /akd) is a short code → backend does the redirect.
      // Runs only after pages like /links didn't match.
      fallback: [
        {
          source: "/:shortCode([A-Za-z0-9_-]+)",
          destination: `${API_URL}/:shortCode`,
        },
      ],
    };
  },
};

export default nextConfig;
