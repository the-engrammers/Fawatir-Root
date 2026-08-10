/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone", // Required for your Docker setup to work
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;



// /** @type {import('next').NextConfig} */
// const nextConfig = {
//   reactStrictMode: true,
//   output: 'standalone',
// };

// module.exports = nextConfig;



