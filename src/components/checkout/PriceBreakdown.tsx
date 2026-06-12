import type { ReactNode } from 'react'
import { formatINR } from '@/lib/utils'

interface PriceBreakdownProps {
    subtotal: number
    deliveryFee: number
    platformFee: number
    discount: number
    discountLabel?: string
    savings?: number
    total: number
    itemCount: number
    freeDeliveryThreshold?: number
    showProgress?: boolean
}

export function PriceBreakdown({
    subtotal,
    deliveryFee,
    platformFee,
    discount,
    discountLabel = 'Coupon',
    savings = 0,
    total,
    itemCount,
    freeDeliveryThreshold,
    showProgress = false,
}: PriceBreakdownProps) {
    const threshold = freeDeliveryThreshold ?? 0
    const remainingForFreeDelivery = Math.max(0, threshold - subtotal)
    const progress = threshold > 0 ? Math.min(100, Math.round((subtotal / threshold) * 100)) : 100

    return (
        <div className="space-y-4">
            <div className="space-y-3">
                <SummaryRow label={`Item total (${itemCount})`} value={formatINR(subtotal)} />
                {savings > 0 && (
                    <SummaryRow
                        label="Savings"
                        value={`-${formatINR(savings)}`}
                        valueClassName="text-[#166534]"
                    />
                )}
                <SummaryRow
                    label="Delivery fee"
                    value={deliveryFee === 0 ? 'FREE' : formatINR(deliveryFee)}
                    valueClassName={deliveryFee === 0 ? 'text-[#166534]' : undefined}
                />
                <SummaryRow label="Platform fee" value={formatINR(platformFee)} />

                {discount > 0 && (
                    <SummaryRow
                        label={discountLabel}
                        value={`-${formatINR(discount)}`}
                        valueClassName="text-[#166534]"
                    />
                )}
            </div>

            <div className="border-t border-[rgba(148,163,184,0.18)] pt-4">
                <SummaryRow
                    label="Total"
                    value={formatINR(total)}
                    labelClassName="text-base font-semibold text-[#16202A]"
                    valueClassName="text-xl font-semibold text-[#16202A]"
                />
            </div>

            {showProgress && threshold > 0 && (
                <div className="rounded-[18px] border border-[rgba(148,163,184,0.18)] bg-[rgba(248,250,252,0.86)] p-4">
                    <div className="flex items-center justify-between gap-3">
                        <p className="text-sm font-medium text-[#475569]">
                            {remainingForFreeDelivery > 0
                                ? `Add ${formatINR(remainingForFreeDelivery)} more for free delivery`
                                : 'Free delivery unlocked'}
                        </p>
                        <span className="text-xs font-semibold text-[#64748B]">{progress}%</span>
                    </div>
                    <div className="mt-3 h-2 overflow-hidden rounded-full bg-[#E2E8F0]">
                        <div
                            className="h-full rounded-full bg-[#16A34A] transition-all duration-300"
                            style={{ width: `${progress}%` }}
                        />
                    </div>
                </div>
            )}
        </div>
    )
}

interface SummaryRowProps {
    label: ReactNode
    value: ReactNode
    labelClassName?: string
    valueClassName?: string
}

function SummaryRow({
    label,
    value,
    labelClassName,
    valueClassName,
}: SummaryRowProps) {
    return (
        <div className="flex items-center justify-between gap-4">
            <span className={labelClassName ?? 'text-sm text-[#68737E]'}>{label}</span>
            <span className={valueClassName ?? 'text-sm font-medium text-[#16202A]'}>{value}</span>
        </div>
    )
}
