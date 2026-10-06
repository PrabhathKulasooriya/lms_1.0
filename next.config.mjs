/** @type {import('next').NextConfig} */
const nextConfig = {
  /* config options here */
  reactCompiler: true,
  transpilePackages: ['react-player', 'youtube-video-element'],
  images: {
    minimumCacheTTL: 86400, // Cache optimized images for at least 24 hours (1 day)
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
  },
};

export default nextConfig;
