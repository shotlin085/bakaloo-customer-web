import api from '@/lib/api'
import type { Product } from '@/types/product.types'
import type { Pagination } from '@/types/api.types'

/**
 * Normalise product data from backend.
 * - Some endpoints return `price` / `sale_price` as strings (PostgreSQL numeric).
 * - Some endpoints omit optional arrays like `images`, `tags`.
 */
export function normalizeProduct(raw: Record<string, unknown>): Product {
    return {
        id: raw.id as string,
        name: raw.name as string,
        slug: raw.slug as string,
        description: (raw.description as string) ?? null,
        price: Number(raw.price) || 0,
        sale_price: raw.sale_price != null ? Number(raw.sale_price) : null,
        salePrice: raw.sale_price != null ? Number(raw.sale_price) : undefined,
        stock_quantity: Number(raw.stock_quantity) || 0,
        unit: (raw.unit as Product['unit']) ?? 'piece',
        category_id: (raw.category_id as string) ?? '',
        category_name: (raw.category_name as string) ?? null,
        images: (raw.images as string[]) ?? [],
        thumbnail_url: (raw.thumbnail_url as string) ?? null,
        is_featured: (raw.is_featured as boolean) ?? false,
        total_sold: Number(raw.total_sold) || 0,
        max_order_qty: raw.max_order_qty != null ? Number(raw.max_order_qty) : null,
        tags: (raw.tags as string[]) ?? [],
        ingredients: (raw.ingredients as string) ?? null,
        allergen_info: (raw.allergen_info as string) ?? null,
        shelf_life: (raw.shelf_life as string) ?? null,
        storage_instructions: (raw.storage_instructions as string) ?? null,
        certifications: (raw.certifications as string[]) ?? null,
        nutrition_info: (raw.nutrition_info as Record<string, string>) ?? null,
        variants: (raw.variants as Product['variants']) ?? null,
        created_at: (raw.created_at as string) ?? new Date().toISOString(),
    }
}

export function normalizeProducts(rawList: Record<string, unknown>[]): Product[] {
    return (rawList ?? []).map(normalizeProduct)
}

export const productsService = {
    getAll: async (params: Record<string, unknown> = {}) => {
        const { data } = await api.get('/products', { params: { page: 1, limit: 20, ...params } })
        return { products: normalizeProducts(data.data), pagination: data.pagination as Pagination }
    },

    getById: async (id: string): Promise<Product> => {
        const { data } = await api.get(`/products/${id}`)
        return normalizeProduct(data.data)
    },

    getFeatured: async (limit = 12): Promise<Product[]> => {
        const { data } = await api.get('/products/featured', { params: { limit } })
        return normalizeProducts(data.data)
    },

    getNewArrivals: async (limit = 12): Promise<Product[]> => {
        const { data } = await api.get('/products/new-arrivals', { params: { limit } })
        return normalizeProducts(data.data)
    },

    getDeals: async (limit = 20): Promise<Product[]> => {
        const { data } = await api.get('/products/deals', { params: { limit } })
        return normalizeProducts(data.data)
    },

    search: async (q: string, page = 1) => {
        const { data } = await api.get('/products/search', { params: { q, page, limit: 20 } })
        return {
            products: normalizeProducts(data.data),
            suggestions: normalizeProducts(data.suggestions || []),
            pagination: data.pagination as Pagination,
        }
    },

    getRelated: async (id: string, limit = 8): Promise<Product[]> => {
        const { data } = await api.get(`/products/${id}/related`, { params: { limit } })
        return normalizeProducts(data.data)
    },
}
