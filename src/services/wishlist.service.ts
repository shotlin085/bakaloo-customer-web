import api from '@/lib/api'
import { normalizeProducts } from '@/services/products.service'
import type { Product } from '@/types/product.types'

export const wishlistService = {
    get: async (): Promise<Product[]> => {
        const { data } = await api.get('/wishlist')
        const items = data.data?.items ?? data.data ?? []
        return Array.isArray(items) ? normalizeProducts(items as Record<string, unknown>[]) : []
    },

    add: async (productId: string): Promise<void> => {
        await api.post('/wishlist/items', { productId })
    },

    addItem: async (productId: string): Promise<void> => {
        await api.post('/wishlist/items', { productId })
    },

    remove: async (productId: string): Promise<void> => {
        await api.delete(`/wishlist/items/${productId}`)
    },

    removeItem: async (productId: string): Promise<void> => {
        await api.delete(`/wishlist/items/${productId}`)
    },

    clear: async (): Promise<void> => {
        await api.delete('/wishlist')
    },

    moveToCart: async (): Promise<{ movedCount: number }> => {
        const { data } = await api.post('/wishlist/move-to-cart')
        return data.data
    },
}
