import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'picsum.photos' },
      { protocol: 'https', hostname: 'fastly.picsum.photos' },
      { protocol: 'https', hostname: 'api.dicebear.com' },
      { protocol: 'https', hostname: 'images.unsplash.com' },
      { protocol: 'https', hostname: '**.cartocdn.com' },
      { protocol: 'https', hostname: 'unpkg.com' },
    ],
  },
  reactStrictMode: true,
  compress: true,
  poweredByHeader: false,
  serverExternalPackages: ["cesium"],
};

export default nextConfig;

