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

// ── UI / UX constants (not business-logic fees — those come from backend) ──
export const OTP_RESEND_SECONDS = 60
export const SEARCH_DEBOUNCE_MS = 300
export const MAX_CART_QTY = 10

// NOTE: FREE_DELIVERY_THRESHOLD, DEFAULT_DELIVERY_FEE, PLATFORM_FEE are
// intentionally removed. All fee values must come from the backend via
// GET /stores/:storeId/fees — never calculated client-side.
// See: src/types/store.types.ts FeeSummary
