// E:\guide-digitali\next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'vzwplpljxdqmdejvzwuw.supabase.co' },
    ],
  },
};

module.exports = nextConfig;
