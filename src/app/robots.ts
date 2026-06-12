import type { MetadataRoute } from 'next'

export default function robots(): MetadataRoute.Robots {
    const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://bakaloo.in'

    return {
        rules: [
            {
                userAgent: '*',
                allow: '/',
                disallow: [
                    '/cart',
                    '/checkout',
                    '/checkout/success',
                    '/orders',
                    '/wallet',
                    '/wishlist',
                    '/profile',
                    '/notifications',
                    '/otp',
                    '/new-user-setup',
                    '/api/',
                ],
            },
        ],
        sitemap: `${baseUrl}/sitemap.xml`,
    }
}
