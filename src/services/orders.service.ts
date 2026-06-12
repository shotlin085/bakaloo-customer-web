import api from '@/lib/api'
import type { Order, PlaceOrderPayload } from '@/types/order.types'
import type { Pagination } from '@/types/api.types'

/* eslint-disable @typescript-eslint/no-explicit-any */
function normalizeOrder(raw: any): Order {
    return {
        id: raw.id,
        order_number: raw.order_number ?? raw.orderNumber ?? '',
        status: raw.status,
        items: raw.items ?? [],
        subtotal: raw.subtotal ?? 0,
        discount_amount: raw.discount_amount ?? raw.discountAmount ?? 0,
        delivery_fee: raw.delivery_fee ?? raw.deliveryFee ?? 0,
        platform_fee: raw.platform_fee ?? raw.platformFee ?? 0,
        total_amount: raw.total_amount ?? raw.totalAmount ?? 0,
        payment_method: raw.payment_method ?? raw.paymentMethod ?? 'COD',
        payment_status: raw.payment_status ?? raw.paymentStatus ?? 'PENDING',
        delivery_otp: raw.delivery_otp ?? raw.deliveryOtp ?? null,
        estimated_minutes: raw.estimated_minutes ?? raw.estimatedMinutes ?? null,
        loyalty_points_earned: raw.loyalty_points_earned ?? raw.loyaltyPointsEarned ?? 0,
        delivery_notes: raw.delivery_notes ?? raw.deliveryNotes ?? null,
        estimated_delivery: raw.estimated_delivery ?? raw.estimatedDelivery ?? null,
        address: raw.address ?? raw.deliveryAddress ?? raw.delivery_address ?? null,
        rider: raw.rider ?? null,
        created_at: raw.created_at ?? raw.createdAt ?? '',
        updated_at: raw.updated_at ?? raw.updatedAt ?? '',
    }
}
/* eslint-enable @typescript-eslint/no-explicit-any */

export const ordersService = {
    place: async (payload: PlaceOrderPayload): Promise<Order> => {
        const { data } = await api.post('/orders', payload)
        return normalizeOrder(data.data)
    },

    getAll: async (params: Record<string, unknown> = {}) => {
        const { data } = await api.get('/orders', { params: { page: 1, limit: 10, ...params } })
        const raw = Array.isArray(data.data) ? data.data : []
        return { orders: raw.map(normalizeOrder), pagination: data.pagination as Pagination }
    },

    getActive: async (): Promise<Order | null> => {
        const { data } = await api.get('/orders/active')
        return data.data ? normalizeOrder(data.data) : null
    },

    getById: async (id: string): Promise<Order> => {
        const { data } = await api.get(`/orders/${id}`)
        return normalizeOrder(data.data)
    },

    cancel: async (id: string, reason: string): Promise<void> => {
        await api.post(`/orders/${id}/cancel`, { reason })
    },

    reorder: async (id: string): Promise<Order> => {
        const { data } = await api.post(`/orders/${id}/reorder`)
        return normalizeOrder(data.data)
    },

    downloadInvoice: async (id: string): Promise<Blob> => {
        const { data } = await api.get(`/orders/${id}/invoice`, { responseType: 'blob' })
        return data
    },
}

