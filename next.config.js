/** @type {import('next').NextConfig} */
const nextConfig = {
  serverExternalPackages: ['better-sqlite3', 'ws'],
  turbopack: {},
};

module.exports = nextConfig;
