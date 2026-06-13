import type { MetadataRoute } from 'next'

export default function manifest(): MetadataRoute.Manifest {
    return {
        name: 'Bakaloo — Fresh Groceries',
        short_name: 'Bakaloo',
        description: 'Fresh groceries delivered in minutes. Order from 1000+ products.',
        start_url: '/',
        display: 'standalone',
        orientation: 'portrait',
        background_color: '#ffffff',
        theme_color: '#22C55E',
        categories: ['shopping', 'food'],
        icons: [
            {
                src: '/icon-192.png',
                sizes: '192x192',
                type: 'image/png',
                purpose: 'maskable',
            },
            {
                src: '/icon-512.png',
                sizes: '512x512',
                type: 'image/png',
                purpose: 'any',
            },
        ],
        shortcuts: [
            {
                name: 'My Cart',
                url: '/cart',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
            {
                name: 'My Orders',
                url: '/orders',
                icons: [{ src: '/icon-192.png', sizes: '192x192' }],
            },
        ],
    }
}
