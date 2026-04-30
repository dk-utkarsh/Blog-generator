import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // resvg ships native bindings as optional deps; let Node resolve them at
  // runtime instead of having Turbopack/webpack try to bundle them.
  serverExternalPackages: ["@resvg/resvg-js"],
  // Bundle Inter TTFs into the serverless functions that rasterize the
  // featured image — without this Vercel won't include them in the function.
  outputFileTracingIncludes: {
    "/api/blog/[id]/featured-image": ["./lib/fonts/**"],
    "/api/push/[id]": ["./lib/fonts/**"],
  },
};

export default nextConfig;
