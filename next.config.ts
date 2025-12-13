// next.config.js
/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone', // or 'export' if you want static export
  // Disable static optimization for problematic paths
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
}

module.exports = nextConfig