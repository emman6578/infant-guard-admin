import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["res.cloudinary.com"],
  },
  typescript: {
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
