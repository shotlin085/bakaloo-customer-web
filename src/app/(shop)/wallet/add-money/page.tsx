'use client'

import { AxiosError } from 'axios'
import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQueryClient } from '@tanstack/react-query'
import { ArrowLeft, Loader2, Wallet } from 'lucide-react'
import { toast } from 'sonner'
import { loadRazorpay, openRazorpayCheckout } from '@/lib/razorpay'
import { QUERY_KEYS } from '@/lib/constants'
import { walletService } from '@/services/wallet.service'
import { useAuthStore } from '@/store/auth.store'
import { cn, formatINR } from '@/lib/utils'

const QUICK_AMOUNTS = [100, 200, 500, 1000]

type TopUpOrder = {
    razorpayOrderId: string
    keyId: string
    amount: number
    currency: string
}

export default function AddMoneyPage() {
    const router = useRouter()
    const qc = useQueryClient()
    const user = useAuthStore((state) => state.user)
    const [amount, setAmount] = useState<number | ''>('')
    const [isProcessing, setIsProcessing] = useState(false)

    useEffect(() => {
        document.title = 'Add Money — Bakaloo Wallet'
    }, [])

    const walletErrorMessage = (error: unknown, fallback: string) =>
        error instanceof AxiosError
            ? ((error.response?.data as { message?: string } | undefined)?.message ?? fallback)
            : fallback

    const handleAddMoney = async () => {
        const value = typeof amount === 'number' ? amount : 0
        if (value < 10) {
            toast.error('Minimum amount is ₹10')
            return
        }

        setIsProcessing(true)
        try {
            await loadRazorpay()

            const order = (await walletService.createTopUp(value)) as TopUpOrder

            await openRazorpayCheckout({
                orderId: order.razorpayOrderId,
                keyId: order.keyId,
                amount: order.amount ?? value,
                currency: order.currency ?? 'INR',
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
                        qc.invalidateQueries({ queryKey: QUERY_KEYS.wallet }),
                        qc.invalidateQueries({ queryKey: QUERY_KEYS.walletTransactions }),
                    ])
                    toast.success(`₹${value} added to wallet!`)
                    router.push('/wallet')
                },
                onDismiss: () => {
                    toast.warning('Payment cancelled')
                },
            })
        } catch (error) {
            toast.error(walletErrorMessage(error, 'Something went wrong'))
        } finally {
            setIsProcessing(false)
        }
    }

    return (
        <div className="page-enter">
            <div className="flex items-center gap-2 px-6 pb-2 pt-4">
                <button
                    onClick={() => router.back()}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 hover:bg-gray-50"
                >
                    <ArrowLeft className="h-4 w-4 text-gray-600" />
                </button>
                <h1 className="text-lg font-bold text-gray-900">Add Money</h1>
            </div>

            <div className="mx-auto max-w-md space-y-6 px-6 py-6">
                <div className="flex justify-center">
                    <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-green-50">
                        <Wallet className="h-8 w-8 text-green-500" strokeWidth={1.5} />
                    </div>
                </div>

                <div className="text-center">
                    <label className="text-sm text-gray-500">Enter Amount</label>
                    <div className="mt-2 flex items-center justify-center gap-1">
                        <span className="text-3xl font-bold text-gray-900">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(event) =>
                                setAmount(event.target.value ? Number(event.target.value) : '')
                            }
                            placeholder="0"
                            className="w-32 bg-transparent text-center text-3xl font-bold text-gray-900 outline-none placeholder:text-gray-300"
                            min={10}
                            max={10000}
                        />
                    </div>
                </div>

                <div className="flex justify-center gap-3">
                    {QUICK_AMOUNTS.map((quickAmount) => (
                        <button
                            key={quickAmount}
                            onClick={() => setAmount(quickAmount)}
                            className={cn(
                                'rounded-xl border px-4 py-2 text-sm font-semibold transition-colors',
                                amount === quickAmount
                                    ? 'border-green-500 bg-green-50 text-green-700'
                                    : 'border-gray-200 bg-white text-gray-700 hover:border-green-300',
                            )}
                        >
                            ₹{quickAmount}
                        </button>
                    ))}
                </div>

                <button
                    onClick={handleAddMoney}
                    disabled={!amount || (typeof amount === 'number' && amount < 10) || isProcessing}
                    className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-green-500 text-base font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-50"
                >
                    {isProcessing ? (
                        <Loader2 className="h-5 w-5 animate-spin" />
                    ) : (
                        `Pay ${amount ? formatINR(typeof amount === 'number' ? amount : 0) : '₹0'}`
                    )}
                </button>
            </div>
        </div>
    )
}
