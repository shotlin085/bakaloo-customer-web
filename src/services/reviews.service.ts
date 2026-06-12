import api from '@/lib/api'
import type { Pagination } from '@/types/api.types'

interface Review {
    id: string
    user_name?: string
    product_name?: string
    product_image?: string | null
    rating?: number
    comment?: string
    created_at?: string
}

interface ReviewEligibility {
    eligible: boolean
    orderId: string | null
    alreadyReviewed: boolean
}

export const reviewsService = {
    getForProduct: async (productId: string, page = 1, limit = 10) => {
        const { data } = await api.get(`/reviews/products/${productId}`, { params: { page, limit } })
        const payload = data.data

        return {
            reviews: (payload?.reviews ?? payload ?? []) as Review[],
            averageRating: Number(payload?.averageRating ?? payload?.average_rating ?? 0),
            pagination: (payload?.pagination ?? data.pagination) as Pagination,
        }
    },

    checkEligibility: async (productId: string) => {
        const { data } = await api.get(`/reviews/eligibility/${productId}`)
        return data.data as ReviewEligibility
    },

    create: async (payload: { productId: string; orderId: string; rating: number; comment: string }) => {
        const { data } = await api.post('/reviews', payload)
        return data.data as Review
    },

    submit: async (payload: { productId: string; orderId: string; rating: number; comment?: string }) => {
        const { data } = await api.post('/reviews', payload)
        return data.data as Review
    },

    update: async (reviewId: string, payload: { rating?: number; comment?: string }) => {
        const { data } = await api.patch(`/reviews/${reviewId}`, payload)
        return data.data as Review
    },

    delete: async (reviewId: string): Promise<void> => {
        await api.delete(`/reviews/${reviewId}`)
    },

    getMyReviews: async (page = 1) => {
        const { data } = await api.get('/reviews/my-reviews', { params: { page, limit: 10 } })
        const payload = data.data

        return {
            reviews: (payload?.reviews ?? payload ?? []) as Review[],
            pagination: (payload?.pagination ?? data.pagination) as Pagination,
        }
    },

    deleteReview: async (id: string): Promise<void> => {
        await api.delete(`/reviews/${id}`)
    },
}
