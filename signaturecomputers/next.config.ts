import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  serverExternalPackages: ['@google-cloud/firestore', 'firebase-admin'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
      {
        protocol: 'https',
        hostname: 'firebasestorage.googleapis.com',
      }
    ],
  },
  async redirects() {
    return [
      { source: '/services/index', destination: '/services', permanent: true },
      { source: '/about/index', destination: '/about', permanent: true },
      { source: '/contact/index', destination: '/contact', permanent: true },
      { source: '/laptop-repair-chennai/index', destination: '/laptop-repair-chennai', permanent: true },
      { source: '/it-support-chennai/index', destination: '/it-support-chennai', permanent: true },
      { source: '/network-security-services/index', destination: '/network-security-services', permanent: true }
    ];
  },
};

export default nextConfig;
