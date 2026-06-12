'use client'

import { CheckCircle2, RotateCcw, ShieldCheck } from 'lucide-react'
import { cn } from '@/lib/utils'
import { PriceBreakdown } from './PriceBreakdown'
import { PrimaryCheckoutButton } from './PrimaryCheckoutButton'
import { TrustBadge } from './TrustBadge'

interface OrderSummaryPanelProps {
    subtotal: number
    deliveryFee: number
    platformFee: number
    discount: number
    total: number
    itemCount: number
    ctaLabel?: string
    onAction?: () => void
    actionDisabled?: boolean
    actionLoading?: boolean
    freeDeliveryThreshold?: number
    className?: string
    stageLabel?: string
}

export function OrderSummaryPanel({
    subtotal,
    deliveryFee,
    platformFee,
    discount,
    total,
    itemCount,
    ctaLabel,
    onAction,
    actionDisabled = false,
    actionLoading = false,
    freeDeliveryThreshold,
    className,
    stageLabel,
}: OrderSummaryPanelProps) {
    return (
        <div
            className={cn(
                'rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.08)] sm:p-6',
                className,
            )}
        >
            <div className="flex items-start justify-between gap-4">
                <div>
                    <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">
                        Secure checkout
                    </p>
                    <h3 className="mt-2 text-xl font-semibold text-slate-950">Order Summary</h3>
                </div>

                {stageLabel && (
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        {stageLabel}
                    </span>
                )}
            </div>

            <div className="mt-5">
                <PriceBreakdown
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    platformFee={platformFee}
                    discount={discount}
                    total={total}
                    itemCount={itemCount}
                    freeDeliveryThreshold={freeDeliveryThreshold}
                    showProgress
                />
            </div>

            <div className="mt-5 space-y-3">
                <TrustBadge
                    icon={ShieldCheck}
                    label="Secure checkout"
                    subtext="Bank-grade payment protection"
                />
                <TrustBadge
                    icon={CheckCircle2}
                    label="No hidden charges"
                    subtext="Every fee is shown before you pay"
                />
                <TrustBadge
                    icon={RotateCcw}
                    label="Easy returns"
                    subtext="Support is available if your order changes"
                />
            </div>

            {ctaLabel && onAction && (
                <div className="mt-6">
                    <PrimaryCheckoutButton
                        label={ctaLabel}
                        loading={actionLoading}
                        disabled={actionDisabled}
                        onClick={onAction}
                    />
                </div>
            )}
        </div>
    )
}
