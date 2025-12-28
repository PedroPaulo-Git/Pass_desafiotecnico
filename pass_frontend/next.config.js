/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: 'standalone', // Para Docker production build
  transpilePackages: ["@pass/schemas"],
}

module.exports = nextConfig
