export type UserRole = 'CUSTOMER' | 'ADMIN' | 'RIDER'

export interface User {
    id: string
    phone: string
    name: string | null
    email: string | null
    role: UserRole
    avatar_url: string | null
    birthday: string | null
    loyalty_points: number
    referral_code: string | null
}

export interface UserStats {
    total_orders: number
    total_spent: number
    loyalty_points: number
}
