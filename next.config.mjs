/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  images: {
    // Portfolios et logos entreprises sont servis par Cloudinary / S3.
    // AVIF puis WebP : indispensable sur les reseaux mobiles ouest-africains.
    formats: ['image/avif', 'image/webp'],
    deviceSizes: [320, 420, 640, 768, 1024, 1280, 1536],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    minimumCacheTTL: 60 * 60 * 24 * 30,
    remotePatterns: [
      { protocol: 'https', hostname: 'res.cloudinary.com' },
      { protocol: 'https', hostname: '**.s3.amazonaws.com' },
      { protocol: 'https', hostname: '**.amazonaws.com' },
    ],
  },
  experimental: {
    optimizePackageImports: ['clsx', 'tailwind-merge'],
  },
};

export default nextConfig;
