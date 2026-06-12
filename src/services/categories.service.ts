import api from '@/lib/api'
import type { Category, Product } from '@/types/product.types'
import type { Pagination } from '@/types/api.types'

export const categoriesService = {
    getAll: async (): Promise<Category[]> => {
        const { data } = await api.get('/categories')
        return data.data
    },

    getById: async (id: string): Promise<Category> => {
        const { data } = await api.get(`/categories/${id}`)
        return data.data
    },

    getProducts: async (id: string, params: Record<string, unknown> = {}) => {
        const { data } = await api.get(`/categories/${id}/products`, {
            params: { page: 1, limit: 20, ...params },
        })
        return { products: data.data as Product[], pagination: data.pagination as Pagination }
    },
}
