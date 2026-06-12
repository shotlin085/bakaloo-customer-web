import api from '@/lib/api'
import type { Pagination } from '@/types/api.types'
import type { WalletBalance, WalletTransaction } from '@/types/wallet.types'

interface WalletTopUpOrder {
    razorpayOrderId: string
    amount: number
    currency: string
    keyId: string
}

interface RawWalletBalance {
    balance?: number | string | null
}

interface RawWalletTransaction {
    id?: string
    type?: 'CREDIT' | 'DEBIT'
    amount?: number | string | null
    description?: string | null
    balanceAfter?: number | string | null
    balance_after?: number | string | null
    status?: 'PENDING' | 'COMPLETED' | 'FAILED'
    createdAt?: string | null
    created_at?: string | null
}

function toNumber(value: unknown, fallback = 0) {
    const parsed = Number(value)
    return Number.isFinite(parsed) ? parsed : fallback
}

function normalizeBalance(raw: RawWalletBalance): WalletBalance {
    return {
        balance: toNumber(raw.balance),
        currency: 'INR',
    }
}

function normalizeTransaction(raw: RawWalletTransaction): WalletTransaction {
    return {
        id: String(raw.id ?? ''),
        type: raw.type === 'DEBIT' ? 'DEBIT' : 'CREDIT',
        amount: toNumber(raw.amount),
        description: raw.description ?? undefined,
        balanceAfter:
            raw.balanceAfter != null
                ? toNumber(raw.balanceAfter)
                : raw.balance_after != null
                    ? toNumber(raw.balance_after)
                    : undefined,
        status: raw.status,
        createdAt: raw.createdAt ?? undefined,
        created_at: raw.created_at ?? raw.createdAt ?? undefined,
    }
}

export const walletService = {
    getBalance: async (): Promise<WalletBalance> => {
        const { data } = await api.get('/wallet')
        return normalizeBalance(data.data as RawWalletBalance)
    },

    getTransactions: async (page = 1, type?: 'CREDIT' | 'DEBIT') => {
        const { data } = await api.get('/wallet/transactions', { params: { page, limit: 20, type } })
        const raw = Array.isArray(data.data) ? (data.data as RawWalletTransaction[]) : []
        return {
            transactions: raw.map(normalizeTransaction),
            pagination: data.pagination as Pagination,
        }
    },

    addMoney: async (amount: number): Promise<WalletTopUpOrder> => {
        const { data } = await api.post('/wallet/topup', { amount })
        return data.data as WalletTopUpOrder
    },

    createTopUp: async (amount: number): Promise<WalletTopUpOrder> => {
        const { data } = await api.post('/wallet/topup', { amount })
        return data.data as WalletTopUpOrder
    },

    verifyTopUp: async (paymentId: string, orderId: string, signature: string) => {
        const { data } = await api.post('/wallet/topup/verify', {
            paymentId,
            orderId,
            signature,
        })
        return data.data
    },

    pay: async (orderId: string) => {
        const { data } = await api.post('/wallet/pay', { orderId })
        return data.data
    },

    transfer: async (phone: string, amount: number, description?: string) => {
        const { data } = await api.post('/wallet/transfer', { phone, amount, description })
        return data.data
    },
}
