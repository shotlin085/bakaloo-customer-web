import api from '@/lib/api'

interface Coupon {
    id: string
    code: string
    discount_type: 'PERCENTAGE' | 'FIXED'
    discount_value: number
    min_order_amount?: number
    max_discount?: number
    valid_until?: string
}

interface CouponValidation {
    valid: boolean
    discount?: number
    discountType?: string
    discountValue?: number
    minOrderAmount?: number
    maxDiscount?: number | null
    code?: string
    couponId?: string
    message?: string
}

export const couponsService = {
    /**
     * Get available coupons for a specific store.
     * GET /coupons/available?storeId=
     */
    getAvailable: async (storeId: string): Promise<Coupon[]> => {
        const { data } = await api.get('/coupons/available', { params: { storeId } })
        return data.data
    },

    /**
     * Validate a coupon code for a store + cart total.
     * POST /coupons/validate — body includes storeId.
     */
    validate: async (
        code: string,
        cartTotal: number,
        storeId: string,
    ): Promise<CouponValidation> => {
        const { data } = await api.post('/coupons/validate', { code, cartTotal, storeId })
        return data.data
    },
}
