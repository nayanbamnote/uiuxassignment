/** @type {import('next').NextConfig} */
const nextConfig = {
  transpilePackages: ['react-calendar-timeline'],
  webpack: (config) => {
    return config;
  },
};

module.exports = nextConfig; 