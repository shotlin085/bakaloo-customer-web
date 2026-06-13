import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/auth.store'
import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import {
    CalendarDays,
    CheckCircle2,
    ChevronRight,
    Mail,
    MessageCircle,
    PhoneCall,
    ShieldCheck,
    Sparkles,
    Truck,
} from 'lucide-react'
import { PriceBreakdown, PrimaryCheckoutButton, TrustBadge } from '@/components/checkout'
import { feesService, type CartBillSummary } from '@/services/fees.service'
import { keys, STALE } from '@/lib/queryKeys'

interface CartSummaryProps {
    subtotal: number
    deliveryFee: number
    platformFee: number
    discount: number
    savings?: number
    total: number
    itemCount: number
    ctaLabel?: string
    onCheckout?: () => void
    className?: string
    promoContent?: ReactNode
    freeDeliveryThreshold?: number
    // Live fees
}

const SUPPORT_PHONE = '+919775845587'
const SUPPORT_EMAIL = 'support@groceryapp.com'

export function CartSummary({
    subtotal,
    deliveryFee: deliveryFeeProp,
    platformFee: platformFeeProp,
    discount,
    savings = 0,
    total: totalProp,
    itemCount,
    ctaLabel = 'Proceed to Checkout',
    onCheckout,
    className = '',
    promoContent,
    freeDeliveryThreshold: freeDeliveryThresholdProp,
}: CartSummaryProps) {
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
    const { data: feeSummary, isLoading: feesLoading } = useQuery<CartBillSummary>({
        queryKey: keys.fees('cart', 'summary'),
        queryFn: () => feesService.getCartSummary(),
        enabled: isLoggedIn,
        staleTime: STALE.fees,
    })

    // Map CartBillSummary fields to display values
    const deliveryFee = feeSummary ? feeSummary.deliveryFee.amount : deliveryFeeProp
    const platformFee = feeSummary ? feeSummary.platformFee.amount : platformFeeProp
    const freeDeliveryThreshold = feeSummary ? feeSummary.freeDelivery.threshold ?? 0 : (freeDeliveryThresholdProp ?? 0)
    const total = feeSummary ? feeSummary.toPay.final : totalProp

    return (
        <div
            className={`overflow-hidden rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(249,246,241,0.98)_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.06)] ${className}`}
        >
            <div className="mb-4">
                <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[#8C949C]">Review</p>
                <h3 className="mt-1.5 text-[24px] font-bold tracking-tight text-[#16202A]">Order Summary</h3>
            </div>

            <div className="rounded-[20px] border border-[rgba(104,72,198,0.1)] bg-white/84 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                <div className="flex items-start justify-between gap-3">
                    <div className="flex items-center gap-3">
                        <span className="flex h-11 w-11 items-center justify-center rounded-[14px] bg-[rgba(104,72,198,0.08)] text-[color:var(--shop-primary)]">
                            <CalendarDays className="h-5 w-5" />
                        </span>
                        <div>
                            <p className="text-sm font-semibold text-[#16202A]">Today, 2-4 PM</p>
                            <p className="mt-1 text-xs text-[#68737E]">Estimated delivery slot</p>
                        </div>
                    </div>
                    <span className="inline-flex items-center gap-1 text-sm font-semibold text-[color:var(--shop-primary)]">
                        Change
                        <ChevronRight className="h-4 w-4" />
                    </span>
                </div>

                {subtotal > 500 && (
                    <div className="mt-3 inline-flex items-center gap-1 rounded-full bg-[rgba(22,101,52,0.08)] px-3 py-1 text-[11px] font-semibold text-[#166534]">
                        <Sparkles className="h-3.5 w-3.5" />
                        Express delivery available
                    </div>
                )}
            </div>

            {promoContent && (
                <div className="mt-4 rounded-[20px] border border-[rgba(104,72,198,0.08)] bg-white/80 p-3.5 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                    {promoContent}
                </div>
            )}

            <div className="mt-4 rounded-[20px] border border-[rgba(104,72,198,0.08)] bg-white/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)]">
                {feesLoading ? (
                    <div className="space-y-2">
                        {Array.from({ length: 4 }).map((_, i) => (
                            <div key={i} className="flex items-center justify-between gap-3">
                                <div className="h-4 w-24 rounded skeleton-shimmer" />
                                <div className="h-4 w-16 rounded skeleton-shimmer" />
                            </div>
                        ))}
                    </div>
                ) : (
                    <PriceBreakdown
                        subtotal={subtotal}
                        deliveryFee={deliveryFee}
                        platformFee={platformFee}
                        discount={discount}
                        discountLabel="Coupon"
                        savings={savings}
                        total={total}
                        itemCount={itemCount}
                        freeDeliveryThreshold={freeDeliveryThreshold}
                        showProgress
                    />
                )}
            </div>

            <div className="mt-3.5 space-y-2">
                <TrustBadge
                    icon={ShieldCheck}
                    label="Secure checkout"
                    subtext="Protected pricing and verified payment flow"
                />
                <TrustBadge
                    icon={CheckCircle2}
                    label="No hidden charges"
                    subtext="Every fee is visible before you continue"
                />
                <TrustBadge
                    icon={Truck}
                    label="Reliable delivery"
                    subtext="Live order timing and delivery updates"
                />
            </div>

            {onCheckout && (
                <div className="mt-4" aria-live="polite">
                    <PrimaryCheckoutButton
                        label={ctaLabel}
                        onClick={onCheckout}
                        className="h-12 rounded-[16px] text-sm hover:scale-[1.02]"
                    />
                </div>
            )}

            <div className="mt-4 rounded-[20px] border border-[rgba(148,163,184,0.18)] bg-[rgba(248,250,252,0.86)] p-4">
                <p className="text-sm font-semibold text-[#16202A]">Need help?</p>
                <div className="mt-3 flex flex-wrap gap-2">
                    <Link
                        href={`https://wa.me/${SUPPORT_PHONE.replace(/\D/g, '')}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 text-sm font-medium text-[#475569]"
                    >
                        <MessageCircle className="h-4 w-4 text-[#166534]" />
                        Chat
                    </Link>
                    <Link
                        href={`tel:${SUPPORT_PHONE}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 text-sm font-medium text-[#475569]"
                    >
                        <PhoneCall className="h-4 w-4 text-[#166534]" />
                        Call
                    </Link>
                    <Link
                        href={`mailto:${SUPPORT_EMAIL}`}
                        className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white px-3 py-2 text-sm font-medium text-[#475569]"
                    >
                        <Mail className="h-4 w-4 text-[#166534]" />
                        Email
                    </Link>
                </div>
            </div>
        </div>
    )
}
