import type { MetadataRoute } from 'next'

const BASE_URL = process.env.NEXT_PUBLIC_SITE_URL || 'https://bakaloo.in'
const API_URL = (() => {
    const base = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:3000/api/v1'
    return base.endsWith('/api/v1') ? base : base.replace(/\/$/, '') + '/api/v1'
})()

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
    const staticPages: MetadataRoute.Sitemap = [
        { url: BASE_URL, lastModified: new Date(), changeFrequency: 'daily', priority: 1.0 },
        { url: `${BASE_URL}/products`, lastModified: new Date(), changeFrequency: 'daily', priority: 0.9 },
        { url: `${BASE_URL}/search`, lastModified: new Date(), changeFrequency: 'weekly', priority: 0.6 },
        { url: `${BASE_URL}/login`, lastModified: new Date(), changeFrequency: 'monthly', priority: 0.3 },
    ]

    let categoryPages: MetadataRoute.Sitemap = []
    try {
        const res = await fetch(`${API_URL}/categories?limit=100`, { next: { revalidate: 3600 } })
        if (res.ok) {
            const json = (await res.json()) as {
                data?: { categories?: Array<{ id: string; updated_at?: string }> } | Array<{ id: string; updated_at?: string }>
                categories?: Array<{ id: string; updated_at?: string }>
            }
            const categories =
                json.data && Array.isArray(json.data)
                    ? json.data
                    : json.data && 'categories' in json.data
                      ? json.data.categories ?? []
                      : json.categories ?? []

            categoryPages = categories.map((cat) => ({
                url: `${BASE_URL}/categories/${cat.id}`,
                lastModified: cat.updated_at ? new Date(cat.updated_at) : new Date(),
                changeFrequency: 'weekly',
                priority: 0.7,
            }))
        }
    } catch {
        // Skip when API unreachable.
    }

    let productPages: MetadataRoute.Sitemap = []
    try {
        const res = await fetch(`${API_URL}/products?limit=500&page=1`, { next: { revalidate: 3600 } })
        if (res.ok) {
            const json = (await res.json()) as {
                data?:
                    | { products?: Array<{ slug: string; updated_at?: string }> }
                    | Array<{ slug: string; updated_at?: string }>
                products?: Array<{ slug: string; updated_at?: string }>
            }
            const products =
                json.data && Array.isArray(json.data)
                    ? json.data
                    : json.data && 'products' in json.data
                      ? json.data.products ?? []
                      : json.products ?? []

            productPages = products
                .filter((p) => Boolean(p.slug))
                .map((p) => ({
                    url: `${BASE_URL}/products/${p.slug}`,
                    lastModified: p.updated_at ? new Date(p.updated_at) : new Date(),
                    changeFrequency: 'daily',
                    priority: 0.8,
                }))
        }
    } catch {
        // Skip when API unreachable.
    }

    return [...staticPages, ...categoryPages, ...productPages]
}
