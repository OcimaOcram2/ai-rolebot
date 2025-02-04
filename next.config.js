/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Disabilita ESLint durante il build per il deploy
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disabilita il type checking durante il build
    ignoreBuildErrors: true,
  },
}

module.exports = nextConfig 