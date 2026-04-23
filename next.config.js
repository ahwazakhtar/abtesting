/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  experimental: {
    // Allow file system writes in serverful Node deployments (Render, local).
    // On Vercel serverless, /data writes won't persist — see README.
  },
};

module.exports = nextConfig;
