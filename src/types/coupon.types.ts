export interface Coupon {
    id: string
    code: string
    discount_type: 'PERCENTAGE' | 'FIXED'
    discount_value: number
    min_order_amount: number
    max_discount?: number
    expires_at?: string
    usage_limit?: number
    used_count?: number
    is_active: boolean
}
