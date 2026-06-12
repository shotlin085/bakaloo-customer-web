import api from '@/lib/api'
import type { Cart } from '@/types/cart.types'

type RawCartItem = {
    id?: string
    productId?: string
    product_id?: string
    name?: string
    price?: number | string | null
    originalPrice?: number | string | null
    original_price?: number | string | null
    salePrice?: number | string | null
    sale_price?: number | string | null
    quantity?: number
    unit?: string
    image?: string | null
    thumbnailUrl?: string | null
    thumbnail_url?: string | null
    slug?: string | null
    subtotal?: number | string | null
    lineTotal?: number | string | null
    line_total?: number | string | null
    inStock?: boolean
    in_stock?: boolean
    stockQuantity?: number | string | null
    stock_quantity?: number | string | null
}

type RawCart = {
    items?: RawCartItem[]
    subtotal?: number | string | null
    count?: number | null
}

function toNumber(value: unknown, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeCartItem(raw: RawCartItem) {
    const basePrice = toNumber(raw.price)
    const salePriceRaw = raw.salePrice ?? raw.sale_price
    const salePrice = salePriceRaw != null ? toNumber(salePriceRaw, basePrice) : null
    const originalPriceRaw = raw.originalPrice ?? raw.original_price ?? basePrice
    const originalPrice = toNumber(originalPriceRaw, basePrice)
    const price = salePrice != null && salePrice < originalPrice ? salePrice : basePrice
    const quantity = Math.max(1, Math.trunc(toNumber(raw.quantity, 1)))
    const subtotal = toNumber(raw.subtotal ?? raw.lineTotal ?? raw.line_total ?? price * quantity)
    const productId = String(raw.productId ?? raw.product_id ?? raw.id ?? '')

    return {
        productId,
        name: String(raw.name ?? 'Product'),
        price,
        originalPrice: originalPrice > price ? originalPrice : null,
        quantity,
        unit: String(raw.unit ?? 'piece'),
        image: raw.image ?? raw.thumbnailUrl ?? raw.thumbnail_url ?? null,
        slug: raw.slug ? String(raw.slug) : productId,
        subtotal,
        inStock: Boolean(raw.inStock ?? raw.in_stock ?? true),
        stockQuantity:
            raw.stockQuantity != null
                ? toNumber(raw.stockQuantity)
                : raw.stock_quantity != null
                    ? toNumber(raw.stock_quantity)
                    : undefined,
    }
}

function normalizeCart(raw: RawCart): Cart {
    const items = (raw.items ?? []).map(normalizeCartItem)
    const subtotal = toNumber(raw.subtotal, items.reduce((sum, item) => sum + item.subtotal, 0))
    const count =
        raw.count != null
            ? Math.max(0, Math.trunc(toNumber(raw.count)))
            : items.reduce((sum, item) => sum + item.quantity, 0)

    return {
        items,
        subtotal,
        count,
    }
}

export const cartService = {
    get: async (): Promise<Cart> => {
        const { data } = await api.get('/cart')
        return normalizeCart(data.data as RawCart)
    },

    addItem: async (productId: string, quantity: number): Promise<Cart> => {
        const { data } = await api.post('/cart/items', { productId, quantity })
        return normalizeCart(data.data as RawCart)
    },

    updateQuantity: async (productId: string, quantity: number): Promise<Cart> => {
        const { data } = await api.put(`/cart/items/${productId}`, { quantity })
        return normalizeCart(data.data as RawCart)
    },

    removeItem: async (productId: string): Promise<void> => {
        await api.delete(`/cart/items/${productId}`)
    },

    clear: async (): Promise<void> => {
        await api.delete('/cart')
    },

    validate: async () => {
        const { data } = await api.post('/cart/validate')
        return data.data as { valid: boolean; items: unknown[]; subtotal: number; warnings: string[] }
    },
}
