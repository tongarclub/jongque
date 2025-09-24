/** @type {import('next').NextConfig} */
const withPWA = require('next-pwa')({
  dest: 'public',
  register: true,
  skipWaiting: true,
  disable: process.env.NODE_ENV === 'development'
});

const createNextIntlPlugin = require('next-intl/plugin');
const withNextIntl = createNextIntlPlugin('./lib/i18n/index.ts');

const nextConfig = {
  // Enable experimental features
  experimental: {
    // Enable Server Components
    serverComponentsExternalPackages: ['@prisma/client']
  },

  // Image optimization
  images: {
    domains: [
      'localhost',
      'via.placeholder.com',
      'lh3.googleusercontent.com', // Google profile images
      'platform-lookaside.fbsbx.com', // Facebook profile images
      'profile.line-scdn.net' // LINE profile images
    ],
    formats: ['image/avif', 'image/webp']
  },

  // Internationalization is now handled by next-intl middleware
  // Remove the built-in i18n config

  // Environment variables
  env: {
    CUSTOM_KEY: 'my-value',
  },

  // Headers for security
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff'
          },
          {
            key: 'X-Frame-Options',
            value: 'DENY'
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block'
          }
        ]
      }
    ];
  },

  // Webpack configuration
  webpack: (config, { buildId, dev, isServer, defaultLoaders, webpack }) => {
    // Add any custom webpack configuration here
    return config;
  }
};

// Combine PWA and NextIntl plugins
module.exports = withNextIntl(withPWA(nextConfig));
