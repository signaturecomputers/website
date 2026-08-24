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
      { source: '/services', destination: '/products', permanent: true },
      { source: '/services/index', destination: '/products', permanent: true },
      { source: '/about/index', destination: '/about', permanent: true },
      { source: '/contact/index', destination: '/contact', permanent: true },
      { source: '/it-support-chennai', destination: '/products', permanent: true },
      { source: '/it-support-chennai/index', destination: '/products', permanent: true },
      { source: '/laptop-repair-chennai', destination: '/products', permanent: true },
      { source: '/laptop-repair-chennai/index', destination: '/products', permanent: true },
      { source: '/network-security-services', destination: '/products', permanent: true },
      { source: '/network-security-services/index', destination: '/products', permanent: true },
      { source: '/category/accessories', destination: '/products?category=accessories', permanent: true },
      { source: '/category/bags', destination: '/products?category=bags', permanent: true },
      { source: '/category/cables', destination: '/products?category=cables', permanent: true },
      { source: '/category/desktops', destination: '/products?category=desktops', permanent: true },
      { source: '/category/docks', destination: '/products?category=docks', permanent: true },
      { source: '/category/dvd-writers', destination: '/products?category=dvd-writers', permanent: true },
      { source: '/category/headphones', destination: '/products?category=headphones', permanent: true },
      { source: '/category/hubs', destination: '/products?category=hubs', permanent: true },
      { source: '/category/keyboards', destination: '/products?category=keyboards', permanent: true },
      { source: '/category/keyboard-mouse-combo', destination: '/products?category=keyboard-mouse-combo', permanent: true },
      { source: '/category/laptops', destination: '/products?category=laptops', permanent: true },
      { source: '/category/memory', destination: '/products?category=memory', permanent: true },
      { source: '/category/memory-storage', destination: '/products?category=memory-storage', permanent: true },
      { source: '/category/monitors', destination: '/products?category=monitors', permanent: true },
      { source: '/category/mouse', destination: '/products?category=mouse', permanent: true },
      { source: '/category/power-adapters', destination: '/products?category=power-adapters', permanent: true },
      { source: '/category/storage', destination: '/products?category=storage', permanent: true },
      { source: '/category/usb-flashdrives', destination: '/products?category=usb-flashdrives', permanent: true },
      { source: '/category/workstations', destination: '/products?category=workstations', permanent: true },
      { source: '/category/:slug', destination: '/products?category=:slug', permanent: true },
      { source: '/product/old-laptop-hdx16', destination: '/products?category=laptops', permanent: true },
      { source: '/product/hp-pavilion-15-old', destination: '/product/hp-pavilion-15-new', permanent: true },
      { source: '/product/dell-inspiron-14-old', destination: '/product/dell-inspiron-14-new', permanent: true }
    ];
  },
};

export default nextConfig;
