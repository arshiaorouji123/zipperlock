/** @type {import('next').NextConfig} */
const nextConfig = {
  // Static export: the `out/` folder can be uploaded to any cPanel / static host.
  output: 'export',
  trailingSlash: true,
  images: { unoptimized: true },
  reactStrictMode: true,
};
export default nextConfig;
