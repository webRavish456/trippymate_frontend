/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  // Disable Turbopack for production builds
  // Turbopack is experimental and can cause build issues
  // Using standard webpack bundler instead
  images: {
    remotePatterns: [
      { protocol: "https", hostname: "lh3.googleusercontent.com" },
    ],
  },
};

export default nextConfig;
