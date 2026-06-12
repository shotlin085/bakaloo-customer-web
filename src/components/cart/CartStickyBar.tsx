'use client'

import { PrimaryCheckoutButton } from '@/components/checkout'
import { formatINR } from '@/lib/utils'

interface CartStickyBarProps {
    itemCount: number
    total: number
    savings?: number
    onCheckout: () => void
    disabled?: boolean
    loading?: boolean
}

export function CartStickyBar({
    itemCount,
    total,
    savings = 0,
    onCheckout,
    disabled = false,
    loading = false,
}: CartStickyBarProps) {
    return (
        <div className="fixed inset-x-0 bottom-0 z-[220] border-t border-white/70 bg-white/88 px-4 py-3 shadow-[0_-18px_32px_rgba(15,23,42,0.10)] backdrop-blur-xl lg:hidden">
            <div className="mx-auto max-w-2xl space-y-3">
                <div className="rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,#FFFFFF_0%,#FBF8F2_100%)] px-4 py-3.5 shadow-[0_10px_22px_rgba(15,23,42,0.05)]">
                    <div className="flex items-end justify-between gap-3">
                        <div aria-live="polite">
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-[#98A0A8]">
                                Basket total
                            </p>
                            <p className="mt-1 text-[24px] font-extrabold tracking-tight text-[#16202A]">
                                {formatINR(total)}
                            </p>
                            {savings > 0 && (
                                <p className="mt-1 text-xs font-semibold text-[#166534]">
                                    You save {formatINR(savings)}
                                </p>
                            )}
                        </div>

                        <p className="text-xs font-medium text-[#6B7280]">
                            {itemCount} item{itemCount !== 1 ? 's' : ''}
                        </p>
                    </div>
                </div>

                <PrimaryCheckoutButton
                    label="🔒 Secure Checkout"
                    onClick={onCheckout}
                    disabled={disabled}
                    loading={loading}
                    className="h-12 rounded-[18px] text-sm"
                />
            </div>
        </div>
    )
}
