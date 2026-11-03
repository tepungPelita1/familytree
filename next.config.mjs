/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the whole app ships as files, so it can be served from the
  // homelab with Nginx and needs no Node process in production.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};

export default nextConfig;
