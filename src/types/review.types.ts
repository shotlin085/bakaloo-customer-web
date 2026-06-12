export interface Review {
    id: string
    product_id: string
    user_id: string
    user_name?: string
    rating: number
    comment?: string
    created_at?: string
    createdAt?: string
    verified_purchase?: boolean
}

export interface ReviewSummary {
    average: number
    total: number
    distribution: Record<string, number>
}
