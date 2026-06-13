/** @type {import('next').NextConfig} */
const nextConfig = {
    eslint: {
        // Don't fail production builds on lint errors.
        // Linting still runs locally and in CI; this keeps Vercel deploys green.
        ignoreDuringBuilds: true,
    },
    images: {
        remotePatterns: [
            { protocol: 'https', hostname: 'res.cloudinary.com', pathname: '/**' },
            { protocol: 'https', hostname: '**.cloudinary.com', pathname: '/**' },
            { protocol: 'https', hostname: 'cdn.dribbble.com', pathname: '/**' },
            { protocol: 'https', hostname: 'bakaloo.in', pathname: '/**' },
            { protocol: 'https', hostname: 'api.bakaloo.in', pathname: '/**' },
            { protocol: 'http', hostname: 'localhost', pathname: '/**' },
        ],
        formats: ['image/avif', 'image/webp'],
        deviceSizes: [640, 750, 828, 1080, 1200, 1920],
        imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
        // Allow Cloudinary to serve pre-optimised images without next/image re-processing
        minimumCacheTTL: 60 * 60 * 24, // 1 day
    },
    async headers() {
        return [
            {
                source: '/(.*)',
                headers: [
                    { key: 'X-Frame-Options', value: 'DENY' },
                    { key: 'X-Content-Type-Options', value: 'nosniff' },
                    { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
                    { key: 'X-XSS-Protection', value: '1; mode=block' },
                ],
            },
            // Long cache for PWA icons
            {
                source: '/(icon-192\\.png|icon-512\\.png|apple-touch-icon\\.png)',
                headers: [
                    { key: 'Cache-Control', value: 'public, max-age=31536000, immutable' },
                ],
            },
        ]
    },
    experimental: {
        optimizePackageImports: [
            'lucide-react',
            'dayjs',
            'framer-motion',   // Tree-shake Framer Motion — saves ~30KB
            '@tanstack/react-query',
        ],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default nextConfig
