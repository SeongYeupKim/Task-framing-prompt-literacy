/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    /** Keep firebase-admin as a Node dependency in server bundles (Next 14). */
    serverComponentsExternalPackages: ["firebase-admin"],
  },
};

export default nextConfig;
