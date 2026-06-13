import api from '@/lib/api'
import type { Category, Product } from '@/types/product.types'
import type { Pagination } from '@/types/api.types'

export const categoriesService = {
    /**
     * Get categories — backend auto-scopes to user's allocated shop via JWT.
     * GET /categories
     */
    getForStore: async (): Promise<Category[]> => {
        const { data } = await api.get('/categories')
        return data.data ?? data ?? []
    },

    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get('/categories')
        return data.data
    },

    getById: async (id: string): Promise<Category> => {
        const { data } = await api.get(`/categories/${id}`)
        return data.data
    },

    getProducts: async (id: string, params: Record<string, unknown> = {}) => {
        // Remove storeId — backend scopes by JWT
        const cleanParams = params as Record<string, unknown>
        const { data } = await api.get(`/categories/${id}/products`, {
            params: { page: 1, limit: 20, ...cleanParams },
        })
        return { products: data.data as Product[], pagination: data.pagination as Pagination }
    },
}
