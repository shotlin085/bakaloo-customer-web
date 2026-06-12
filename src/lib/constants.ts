import type { OrderStatus } from '@/types/order.types'

export const ORDER_STATUS_CONFIG: Record<
    OrderStatus,
    { label: string; color: string; bg: string }
> = {
    PENDING: { label: 'Order Placed', color: '#F59E0B', bg: '#FFFBEB' },
    CONFIRMED: { label: 'Confirmed', color: '#3B82F6', bg: '#EFF6FF' },
    PREPARING: { label: 'Preparing', color: '#8B5CF6', bg: '#F5F3FF' },
    PACKED: { label: 'Packed', color: '#0EA5E9', bg: '#F0F9FF' },
    OUT_FOR_DELIVERY: { label: 'Out for Delivery', color: '#F97316', bg: '#FFF7ED' },
    DELIVERED: { label: 'Delivered', color: '#22C55E', bg: '#F0FDF4' },
    CANCELLED: { label: 'Cancelled', color: '#EF4444', bg: '#FEF2F2' },
    REFUNDED: { label: 'Refunded', color: '#6B7280', bg: '#F9FAFB' },
} as const

export const QUERY_KEYS = {
    cart: ['cart'] as const,
    categories: ['categories'] as const,
    products: (p?: Record<string, unknown>) => ['products', p] as const,
    product: (id: string) => ['product', id] as const,
    orders: (p?: Record<string, unknown>) => ['orders', p] as const,
    order: (id: string) => ['order', id] as const,
    wishlist: ['wishlist'] as const,
    wallet: ['wallet'] as const,
    walletTransactions: ['wallet-transactions'] as const,
    notifications: ['notifications'] as const,
    addresses: ['addresses'] as const,
    user: ['user'] as const,
    banners: ['banners'] as const,
    reviews: (productId: string) => ['reviews', productId] as const,
    myReviews: ['my-reviews'] as const,
} as const

export const STALE_TIMES = {
    banners: 30 * 60 * 1000,
    categories: 30 * 60 * 1000,
    products: 5 * 60 * 1000,
    cart: 0,
    orders: 30 * 1000,
    wallet: 0,
    notifications: 0,
    user: 15 * 60 * 1000,
    addresses: 10 * 60 * 1000,
} as const

export const FREE_DELIVERY_THRESHOLD = 299
export const PLATFORM_FEE = 5
export const DEFAULT_DELIVERY_FEE = 29
export const OTP_RESEND_SECONDS = 60
export const SEARCH_DEBOUNCE_MS = 300
export const MAX_CART_QTY = 10
