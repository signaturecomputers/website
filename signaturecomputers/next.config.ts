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
      { source: '/network-security-services/index', destination: '/network-security-services', permanent: true },
      { source: '/product/old-laptop-hdx16', destination: '/category/laptops', permanent: true },
      { source: '/product/hp-pavilion-15-old', destination: '/product/hp-pavilion-15-new', permanent: true },
      { source: '/product/dell-inspiron-14-old', destination: '/product/dell-inspiron-14-new', permanent: true }
    ];
  },
};

export default nextConfig;
