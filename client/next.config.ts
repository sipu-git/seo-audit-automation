import type { NextConfig } from "next";

const backendApiUrl = (
  process.env.BACKEND_API_URL ?? "https://seo-audit-automation.onrender.com"
  // process.env.BACKEND_API_URL ?? "http://localhost:4000"
).replace(/\/+$/, "");

const nextConfig: NextConfig = {
  async rewrites() {
    return [
      {
        source: "/graphql",
        destination: `${backendApiUrl}/graphql`,
      },
      {
        source: "/api/audits/:path*",
        destination: `${backendApiUrl}/api/audits/:path*`,
      },
      {
        source: "/api/profile-picture",
        destination: `${backendApiUrl}/api/profile-picture`,
      },
    ];
  },
  experimental: {
    agentFeedback: true,
  },
  cacheComponents: true,
  partialPrefetching: true,
  turbopack: {
    rules: {
      "*.css": {
        loaders: ["@tailwindcss/turbopack"],
        as: "*.css",
      },
    },
  },
};

export default nextConfig;
