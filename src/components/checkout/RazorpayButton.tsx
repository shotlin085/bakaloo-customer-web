'use client'

import { useState } from 'react'
import { CreditCard, Loader2 } from 'lucide-react'
import { toast } from 'sonner'
import { loadRazorpay, openRazorpayCheckout } from '@/lib/razorpay'

interface RazorpayButtonProps {
    amount: number
    orderId: string
    razorpayOrderId: string
    description: string
    prefill?: { contact?: string; email?: string; name?: string }
    onSuccess: (payment: {
        razorpay_payment_id: string
        razorpay_order_id: string
        razorpay_signature: string
    }) => void | Promise<void>
    onDismiss?: () => void
    label?: string
    className?: string
}

export function RazorpayButton({
    amount,
    orderId,
    razorpayOrderId,
    description,
    prefill,
    onSuccess,
    onDismiss,
    label = 'Pay Now',
    className,
}: RazorpayButtonProps) {
    const [loading, setLoading] = useState(false)

    const handlePay = async () => {
        setLoading(true)
        try {
            await loadRazorpay()
            void orderId

            const keyId = process.env.NEXT_PUBLIC_RAZORPAY_KEY_ID || ''
            if (!keyId) {
                toast.error('Missing Razorpay key')
                return
            }

            await openRazorpayCheckout({
                orderId: razorpayOrderId,
                amount,
                currency: 'INR',
                keyId,
                userPhone: prefill?.contact ?? '',
                userName: prefill?.name ?? 'Bakaloo User',
                onSuccess: async (payment) => {
                    await onSuccess(payment)
                },
                onDismiss: () => {
                    onDismiss?.()
                    setLoading(false)
                },
            })
        } catch {
            toast.error('Payment failed')
        } finally {
            setLoading(false)
        }
    }

    return (
        <button
            onClick={handlePay}
            disabled={loading}
            className={
                className ??
                'flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:opacity-50'
            }
            title={description}
            type="button"
        >
            {loading ? (
                <Loader2 className="h-5 w-5 animate-spin" />
            ) : (
                <>
                    <CreditCard className="h-4 w-4" />
                    {label}
                </>
            )}
        </button>
    )
}
