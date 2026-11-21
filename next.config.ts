import type { NextConfig } from "next";

/**
 * Set PAGES_BASE_PATH (e.g. "/Portfolio") when building for GitHub Pages,
 * which serves the site from https://<user>.github.io/<repo>/.
 * Leave it unset for local dev or hosts that serve from the domain root.
 */
const basePath = process.env.PAGES_BASE_PATH || "";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
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
