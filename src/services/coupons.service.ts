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
    getAvailable: async (): Promise<Coupon[]> => {
        const { data } = await api.get('/coupons/available')
        return data.data
    },

    validate: async (code: string, cartTotal: number): Promise<CouponValidation> => {
        const { data } = await api.post('/coupons/validate', { code, cartTotal })
        return data.data
    },
}
