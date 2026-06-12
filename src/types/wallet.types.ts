export interface WalletBalance {
    balance: number
    currency: string
}

export interface WalletTransaction {
    id: string
    type: 'CREDIT' | 'DEBIT'
    amount: number
    description?: string
    balanceAfter?: number
    status?: 'PENDING' | 'COMPLETED' | 'FAILED'
    created_at?: string
    createdAt?: string
}
