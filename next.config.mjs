/** @type {import('next').NextConfig} */
const nextConfig = {
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
        ]
    },
    experimental: {
        optimizePackageImports: ['lucide-react', 'dayjs'],
    },
    compiler: {
        removeConsole: process.env.NODE_ENV === 'production',
    },
}

export default nextConfig
