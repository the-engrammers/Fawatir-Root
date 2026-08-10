/** @type {import('next').NextConfig} */
const nextConfig = {
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Optional: Set to true if TypeScript errors also block Docker builds
    ignoreBuildErrors: false,
  },
};

module.exports = nextConfig; // Use module.exports if CommonJS, or rename file to next.config.mjs if using ES imports

// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'standalone',
// };

// module.exports = nextConfig;



