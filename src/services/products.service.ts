import api from '@/lib/api'
import type { Product, ShopProduct } from '@/types/product.types'
import type { Pagination } from '@/types/api.types'

/**
 * Normalise product data from backend.
 * Handles both master-product and shop-product shapes.
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
        // Multi-vendor fields
        shop_id: (raw.shop_id as string) ?? null,
        shop_product_id: (raw.shop_product_id as string) ?? null,
        shop_name: (raw.shop_name as string) ?? null,
        shop_price: raw.shop_price != null ? Number(raw.shop_price) : null,
        shop_stock: raw.shop_stock != null ? Number(raw.shop_stock) : null,
        shop_is_active: (raw.shop_is_active as boolean) ?? null,
        // Family / options
        family_id: ((raw.family_id ?? raw.product_family_id) as string) ?? null,
        option_label: (raw.option_label as string) ?? null,
        option_count: raw.option_count != null ? Number(raw.option_count) : null,
        net_quantity: (raw.net_quantity as string) ?? null,
        avg_rating: raw.avg_rating != null ? Number(raw.avg_rating) : null,
        rating_count: raw.rating_count != null ? Number(raw.rating_count) : null,
    }
}

export function normalizeProducts(rawList: Record<string, unknown>[]): Product[] {
    return (rawList ?? []).map(normalizeProduct)
}

export const productsService = {
    // ── Master catalog (global, no storeId required) ───────────────────────

    getAll: async (params: Record<string, unknown> = {}) => {
        const { data } = await api.get('/products', { params: { page: 1, limit: 20, ...params } })
        return { products: normalizeProducts(data.data), pagination: data.pagination as Pagination }
    },

    getById: async (id: string): Promise<Product> => {
        const { data } = await api.get(`/products/${id}`)
        return normalizeProduct(data.data)
    },

    // ── Shop-scoped endpoints (require storeId) ────────────────────────────

    /**
     * Get products — backend auto-scopes to user's allocated shop via JWT.
     * GET /products?page=&limit=&categoryId=&sort=&inStock=
     * (replaces the staff-only /shop-products endpoint)
     */
    getShopProducts: async (
        _storeId: string,
        params: Record<string, unknown> = {},
    ) => {
        // Strip storeId — backend uses JWT allocation, not query param
        const cleanParams = params as Record<string, unknown>
        const { data } = await api.get('/products', {
            params: { page: 1, limit: 20, ...cleanParams },
        })
        return { products: normalizeProducts(data.data), pagination: data.pagination as Pagination }
    },

    /**
     * Get a single product by shopProductId.
     * The backend returns a `store` block on product detail when authenticated.
     * GET /products/:id
     */
    getShopProduct: async (shopProductId: string): Promise<ShopProduct> => {
        const { data } = await api.get(`/products/${shopProductId}`)
        return normalizeProduct(data.data) as ShopProduct
    },

    /**
     * Get a shop product by slug — backend resolves store info from JWT.
     * GET /products/:slug
     */
    getShopProductBySlug: async (slug: string): Promise<ShopProduct> => {
        const { data } = await api.get(`/products/${slug}`)
        const raw = data.data
        if (!raw) throw new Error(`Product "${slug}" not found`)
        return normalizeProduct(raw) as ShopProduct
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

    /**
     * Search products — backend auto-scopes to the user's allocated shop via JWT.
     * GET /products/search?q=&page=&limit=
     */
    searchShopProducts: async (_storeId: string, q: string, page = 1) => {
        const { data } = await api.get('/products/search', {
            params: { q, page, limit: 20 },
        })
        return {
            products: normalizeProducts(data.data),
            suggestions: normalizeProducts(data.suggestions || []),
            pagination: data.pagination as Pagination,
        }
    },

    // Keep old name as alias
    search: async (q: string, page = 1) => {
        const { data } = await api.get('/products/search', { params: { q, page, limit: 20 } })
        return {
            products: normalizeProducts(data.data),
            suggestions: normalizeProducts(data.suggestions || []),
            pagination: data.pagination as Pagination,
        }
    },

    getRelated: async (productId: string, limit = 8): Promise<Product[]> => {
        const { data } = await api.get(`/products/${productId}/related`, { params: { limit } })
        return normalizeProducts(data.data)
    },

    /**
     * Get all purchasable options for a product family (scoped by JWT).
     * GET /products/:id/options   ← real backend endpoint
     * Returns: { family: {...}, options: Product[] }
     */
    getProductFamily: async (productId: string): Promise<ShopProduct[]> => {
        const { data } = await api.get(`/products/${productId}/options`)
        const raw = data.data?.options ?? data.data ?? data
        return normalizeProducts(Array.isArray(raw) ? raw : []) as ShopProduct[]
    },
}
