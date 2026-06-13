'use client'

import { AxiosError } from 'axios'
import { useEffect, useMemo, useState } from 'react'
import { useQuery, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { keys, STALE } from '@/lib/queryKeys'
import { walletService } from '@/services/wallet.service'
import { loadRazorpay, openRazorpayCheckout } from '@/lib/razorpay'
import { useAuthStore } from '@/store/auth.store'
import { formatINR, formatDateTime } from '@/lib/utils'
import { EmptyStateCard, PageHeader, PageShell } from '@/components/shared'
import { Wallet, ArrowUpRight, ArrowDownLeft, Plus, Sparkles, X } from 'lucide-react'
import { toast } from 'sonner'

export default function WalletPage() {
    const qc = useQueryClient()
    const user = useAuthStore((s) => s.user)
    const [showAddMoney, setShowAddMoney] = useState(false)
    const [amount, setAmount] = useState('')
    const [isAdding, setIsAdding] = useState(false)

    useEffect(() => {
        document.title = 'Wallet — Bakaloo'
    }, [])

    const { data: balance, isLoading: loadingBalance } = useQuery({
        queryKey: keys.wallet(),
        queryFn: walletService.getBalance,
        staleTime: STALE.wallet,
    })

    const { data: txData, isLoading: loadingTx } = useQuery({
        queryKey: keys.walletTransactions(),
        queryFn: () => walletService.getTransactions(),
        staleTime: STALE.wallet,
    })

    const transactions = txData?.transactions ?? []
    const amountNumber = useMemo(() => Number(amount), [amount])
    const canSubmit = Number.isFinite(amountNumber) && amountNumber >= 10 && amountNumber <= 10000 && !isAdding

    const closeSheet = () => {
        setShowAddMoney(false)
        setAmount('')
    }

    const walletErrorMessage = (error: unknown, fallback: string) =>
        error instanceof AxiosError
            ? ((error.response?.data as { message?: string } | undefined)?.message ?? fallback)
            : fallback

    const handleAddMoney = async () => {
        if (!canSubmit) {
            toast.error('Enter a valid amount between ₹10 and ₹10,000')
            return
        }

        setIsAdding(true)

        try {
            await loadRazorpay()
            const topup = await walletService.addMoney(amountNumber)

            await openRazorpayCheckout({
                amount: topup.amount,
                currency: topup.currency,
                orderId: topup.razorpayOrderId,
                keyId: topup.keyId,
                userPhone: user?.phone ?? '',
                userName: user?.name ?? 'Bakaloo User',
                userEmail: user?.email ?? '',
                description: 'Wallet Top-up',
                onSuccess: async (payment) => {
                    await walletService.verifyTopUp(
                        payment.razorpay_payment_id,
                        payment.razorpay_order_id,
                        payment.razorpay_signature,
                    )
                    await Promise.all([
                        qc.invalidateQueries({ queryKey: keys.wallet() }),
                        qc.invalidateQueries({ queryKey: keys.walletTransactions() }),
                    ])
                    toast.success(`₹${amountNumber.toLocaleString('en-IN')} added to wallet!`)
                    closeSheet()
                },
                onDismiss: () => {
                    toast.warning('Payment cancelled')
                },
            })
        } catch (error) {
            toast.error(walletErrorMessage(error, 'Could not add money right now'))
        } finally {
            setIsAdding(false)
        }
    }

    return (
        <PageShell className="pb-24" spacing="relaxed">
            <PageHeader
                eyebrow="Balance & credits"
                title="Wallet"
                subtitle="Track wallet balance, top up instantly, and review every transaction in one place."
            />

            {/* ── Balance Card ── */}
            <div className="shop-hero-surface relative overflow-hidden rounded-[28px] p-6 text-white shadow-[var(--shop-shadow-strong)]">
                {/* Decorative elements */}
                <div className="absolute -top-8 -right-8 w-32 h-32 bg-white/5 rounded-full" />
                <div className="absolute -bottom-6 left-12 w-24 h-24 bg-white/5 rounded-full" />
                <Sparkles className="absolute top-5 right-5 w-6 h-6 text-white/15" />

                <div className="relative">
                    <div className="flex items-center gap-3 mb-4">
                        <div className="w-11 h-11 bg-white/15 rounded-xl flex items-center justify-center backdrop-blur">
                            <Wallet className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-sm font-medium text-white/70">Available Balance</span>
                    </div>

                    {loadingBalance ? (
                        <div className="skeleton-shimmer h-10 w-36 rounded-lg bg-white/10" />
                    ) : (
                        <p className="text-[36px] font-extrabold leading-none">{formatINR(balance?.balance ?? 0)}</p>
                    )}

                    <button
                        type="button"
                        onClick={() => setShowAddMoney(true)}
                        className="mt-5 flex h-10 items-center gap-2 rounded-xl border border-white/20 bg-white/15 px-5 text-sm font-semibold text-white backdrop-blur transition-colors hover:bg-white/25"
                    >
                        <Plus className="w-4 h-4" />
                        Add Money
                    </button>
                </div>
            </div>

            {/* ── Transaction History ── */}
            <h2 className="text-lg font-bold text-[color:var(--shop-ink)]">Transaction History</h2>

            {loadingTx ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="skeleton-shimmer h-[72px] w-full rounded-2xl" />
                    ))}
                </div>
            ) : transactions.length === 0 ? (
                <EmptyStateCard
                    icon={Wallet}
                    title="No transactions yet"
                    subtitle="Your wallet top-ups, refunds, and balance activity will appear here once you start using wallet credits."
                />
            ) : (
                <div className="space-y-2">
                    {transactions.map((tx) => (
                        <div
                            key={tx.id}
                            className="flex items-center gap-4 rounded-[22px] border border-[color:var(--shop-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,239,0.98)_100%)] p-4 transition-shadow hover:shadow-[0_12px_26px_rgba(15,23,42,0.08)]"
                        >
                            <div
                                className={`w-10 h-10 rounded-full flex items-center justify-center ${tx.type === 'CREDIT' ? 'bg-green-50 text-green-500' : 'bg-red-50 text-red-500'
                                    }`}
                            >
                                {tx.type === 'CREDIT' ? <ArrowDownLeft className="w-4 h-4" /> : <ArrowUpRight className="w-4 h-4" />}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-medium text-gray-900 truncate">{tx.description}</p>
                                <p className="text-xs text-gray-400 mt-0.5">
                                    {formatDateTime(tx.created_at ?? tx.createdAt ?? '')}
                                </p>
                            </div>
                            <span
                                className={`text-[15px] font-bold tabular-nums ${tx.type === 'CREDIT' ? 'text-green-500' : 'text-red-500'
                                    }`}
                            >
                                {tx.type === 'CREDIT' ? '+' : '−'}{formatINR(tx.amount)}
                            </span>
                        </div>
                    ))}
                </div>
            )}

            <AnimatePresence>
                {showAddMoney && (
                    <motion.div
                        className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        onClick={closeSheet}
                    >
                        <motion.div
                            className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-white p-5"
                            initial={{ y: '100%' }}
                            animate={{ y: 0 }}
                            exit={{ y: '100%' }}
                            transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                            onClick={(event) => event.stopPropagation()}
                        >
                            <div className="mb-4 flex items-center justify-between">
                                <h3 className="text-lg font-bold text-gray-900">Add Money to Wallet</h3>
                                <button
                                    type="button"
                                    onClick={closeSheet}
                                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                    aria-label="Close add money sheet"
                                >
                                    <X className="h-4 w-4" strokeWidth={1.5} />
                                </button>
                            </div>

                            <div className="mb-4 grid grid-cols-4 gap-2">
                                {[100, 200, 500, 1000].map((value) => (
                                    <button
                                        key={value}
                                        type="button"
                                        onClick={() => setAmount(String(value))}
                                        className={`h-10 rounded-xl border text-sm font-semibold transition-colors ${
                                            amountNumber === value
                                                ? 'border-green-500 bg-green-50 text-green-700'
                                                : 'border-gray-200 text-gray-700 hover:border-green-300'
                                        }`}
                                    >
                                        ₹{value}
                                    </button>
                                ))}
                            </div>

                            <input
                                type="number"
                                min={10}
                                max={10000}
                                value={amount}
                                onChange={(event) => setAmount(event.target.value)}
                                placeholder="Enter amount"
                                className="h-14 w-full rounded-xl border border-gray-200 px-4 text-base font-semibold text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                            />

                            <button
                                type="button"
                                onClick={handleAddMoney}
                                disabled={!canSubmit}
                                className="mt-4 inline-flex h-12 w-full items-center justify-center rounded-xl bg-green-500 px-4 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {isAdding
                                    ? 'Processing...'
                                    : `Pay ₹${amountNumber > 0 ? amountNumber.toLocaleString('en-IN') : ''}`}
                            </button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </PageShell>
    )
}
