import api from '@/lib/api'
import type { RazorpayOrder, PaymentVerifyPayload, PaymentHistory } from '@/types/payment.types'
import type { Pagination } from '@/types/api.types'

export const paymentsService = {
    createOrder: async (orderId: string): Promise<RazorpayOrder> => {
        const { data } = await api.post('/payments/create-order', { orderId })
        return data.data
    },

    verify: async (payload: PaymentVerifyPayload): Promise<void> => {
        await api.post('/payments/verify', payload)
    },

    getHistory: async (page = 1) => {
        const { data } = await api.get('/payments/history', { params: { page, limit: 10 } })
        return { payments: data.data as PaymentHistory[], pagination: data.pagination as Pagination }
    },
}
