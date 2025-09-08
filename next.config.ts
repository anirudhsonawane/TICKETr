import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  images: {
    remotePatterns: [
      // Convex Dev
      {
        protocol: "https",
        hostname: "ceaseless-cat-661.convex.cloud",
        pathname: "/api/storage/**",
      },
      // Convex Prod
      {
        protocol: "https",
        hostname: "robust-vulture-107.convex.cloud",
        pathname: "/api/storage/**",
      },
      // Example images
      {
        protocol: "https",
        hostname: "picsum.photos",
        pathname: "/**",
      },
    ],
  },
};

export default nextConfig;
