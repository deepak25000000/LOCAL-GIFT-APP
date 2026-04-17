import type { NextConfig } from "next";
import CopyPlugin from "copy-webpack-plugin";
import path from "path";

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
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.plugins.push(
        new CopyPlugin({
          patterns: [
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Workers"),
              to: path.join(__dirname, "public/cesium/Workers"),
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/ThirdParty"),
              to: path.join(__dirname, "public/cesium/ThirdParty"),
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Assets"),
              to: path.join(__dirname, "public/cesium/Assets"),
            },
            {
              from: path.join(__dirname, "node_modules/cesium/Build/Cesium/Widgets"),
              to: path.join(__dirname, "public/cesium/Widgets"),
            },
          ],
        })
      );
    }
    return config;
  },
};

export default nextConfig;
