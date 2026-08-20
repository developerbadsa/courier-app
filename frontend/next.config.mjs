/** @type {import('next').NextConfig} */
const nextConfig = {
  output: 'standalone',
  reactStrictMode: true,
  poweredByHeader: false,
  onDemandEntries: {
    // Keep compiled dev pages in memory longer (60 seconds) so chunks don't 404
    maxInactiveAge: 60 * 1000,
    pagesBufferLength: 10,
  },
  webpack: (config, { dev }) => {
    if (dev) {
      config.watchOptions = {
        poll: 1000,
        aggregateTimeout: 300,
      };
    }
    return config;
  },
};

export default nextConfig;
