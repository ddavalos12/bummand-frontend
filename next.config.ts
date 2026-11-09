import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  devIndicators: false,
  async rewrites() {
    const backendUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3002";
    return [
      {
        source: "/api/:path*",
        destination: `${backendUrl}/api/:path*`,
      },
      {
        source: "/becarios/:path*",
        destination: `${backendUrl}/api/becarios/:path*`,
      },
      {
        source: "/pasajes/:path*",
        destination: `${backendUrl}/pasajes/:path*`,
      },
    ];
  },
};

export default nextConfig;
