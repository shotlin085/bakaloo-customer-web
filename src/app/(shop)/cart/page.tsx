'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, Sparkles } from 'lucide-react'
import { useCart } from '@/hooks/useCart'
import { useCoupon } from '@/hooks/useCoupon'
import { CouponSheet } from '@/components/checkout/CouponSheet'
import {
    CartCrossSell,
    CartEmpty,
    CartItem,
    CartItemMobile,
    CartStickyBar,
    CartSummary,
    FreeDeliveryBar,
    PromoCodeInput,
} from '@/components/cart'
import { cartSavings } from '@/components/cart/cart.utils'
import { CartStoreSwitchDialog } from '@/components/store/CartStoreSwitchDialog'
import { useCartStore } from '@/store/cart.store'
import { formatINR } from '@/lib/utils'

// Fee values are now served from the backend FeeSummary — using 0 as placeholder
// until cart page is updated to use the fees API.
const FREE_DELIVERY_THRESHOLD = 0
const DEFAULT_DELIVERY_FEE = 0
const PLATFORM_FEE = 0

export default function CartPage() {
    const router = useRouter()
    const reduceMotion = useReducedMotion()
    const { cart, isLoading, updateQty, removeFromCart, pendingCrossStore, confirmStoreSwitchAndAdd, cancelStoreSwitch } = useCart()
    const cartStore = useCartStore()
    const subtotal = cart?.subtotal ?? 0
    const [showCouponSheet, setShowCouponSheet] = useState(false)
    const { coupon, applyCoupon, removeCoupon, isValidating } = useCoupon(subtotal)

    useEffect(() => {
        document.title = 'My Cart — Bakaloo'
    }, [])

    if (isLoading) {
        return (
            <div className="page-enter px-4 py-6 sm:px-5 lg:px-6">
                <div className="mb-6 h-4 w-24 rounded-lg skeleton-shimmer" />
                <div className="mb-2 h-12 w-52 rounded-lg skeleton-shimmer" />
                <div className="mb-8 h-5 w-64 rounded-lg skeleton-shimmer" />
                <div className="grid gap-7 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)]">
                    <div className="space-y-4">
                        <div className="h-24 rounded-[22px] skeleton-shimmer" />
                        {Array.from({ length: 3 }).map((_, i) => (
                            <div key={i} className="h-40 rounded-[24px] skeleton-shimmer" />
                        ))}
                    </div>
                    <div className="hidden h-[560px] rounded-[28px] skeleton-shimmer lg:block" />
                </div>
            </div>
        )
    }

    if (!cart || cart.items.length === 0) {
        return (
            <div className="page-enter px-4 py-8 sm:px-5 lg:px-6">
                <CartEmpty />
            </div>
        )
    }

    const lineItemCount = cart.items.length
    const totalSavings = cartSavings(cart.items)
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE
    const total = Math.max(0, subtotal + deliveryFee + PLATFORM_FEE - coupon.discount)
    const cartProductIds = cart.items.map((item) => item.productId)

    const renderPromoBlock = () => (
        <PromoCodeInput
            appliedCode={coupon.code}
            discount={coupon.discount}
            isValidating={isValidating}
            onApply={(code) => applyCoupon(code)}
            onRemove={removeCoupon}
            onViewCoupons={() => setShowCouponSheet(true)}
        />
    )

    return (
        <>
            <div className="page-enter px-4 py-5 pb-32 sm:px-5 lg:px-6 lg:pb-8">
                <section className="mb-5">
                    <div className="flex flex-col gap-3 border-b border-[rgba(17,24,39,0.06)] pb-4 lg:flex-row lg:items-end lg:justify-between">
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[#98A0A8]">Basket review</p>
                            <h1 className="mt-2 text-[32px] font-bold leading-none tracking-[-0.05em] text-[#16202A] sm:text-[36px]">
                                Your Cart
                            </h1>
                            <p className="mt-2 text-sm text-[#68737E]">
                                {lineItemCount} item{lineItemCount !== 1 ? 's' : ''} ready for checkout
                            </p>

                            {totalSavings > 0 && (
                                <motion.div
                                    initial={reduceMotion ? false : { opacity: 0, y: -16 }}
                                animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
                                className="mt-3 inline-flex items-center gap-2 rounded-full bg-[rgba(22,101,52,0.08)] px-4 py-2 text-sm font-semibold text-[#166534]"
                            >
                                <Sparkles className="h-4 w-4" />
                                You&apos;re saving {formatINR(totalSavings)} on this order! 🎉
                            </motion.div>
                        )}
                        </div>

                        <Link
                            href="/products"
                            className="inline-flex items-center gap-2 self-start text-sm font-semibold text-[color:var(--shop-primary)] transition-colors hover:text-[color:var(--shop-primary-hover)] lg:self-auto"
                        >
                            Continue shopping
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>
                </section>

                <div className="grid gap-5 lg:grid-cols-[minmax(0,1.55fr)_minmax(320px,0.95fr)] lg:items-start">
                    <div className="space-y-4">
                        <FreeDeliveryBar subtotal={subtotal} threshold={FREE_DELIVERY_THRESHOLD} />

                        <div className="rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,241,0.96)_100%)] p-3.5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] lg:hidden">
                            {renderPromoBlock()}
                        </div>

                        <section className="rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,241,0.96)_100%)] p-3.5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] lg:hidden">
                            <div className="space-y-3">
                                <AnimatePresence initial={false}>
                                    {cart.items.map((item) => (
                                        <CartItemMobile
                                            key={item.shopProductId}
                                            item={item}
                                            onQtyChange={(qty) => updateQty(item.shopProductId, qty)}
                                            onRemove={() => removeFromCart(item.shopProductId)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>

                        <section className="hidden rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(250,247,241,0.96)_100%)] p-3.5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] lg:block">
                            <div className="space-y-4">
                                <AnimatePresence initial={false}>
                                    {cart.items.map((item) => (
                                        <CartItem
                                            key={item.shopProductId}
                                            item={item}
                                            onQtyChange={(qty) => updateQty(item.shopProductId, qty)}
                                            onRemove={() => removeFromCart(item.shopProductId)}
                                        />
                                    ))}
                                </AnimatePresence>
                            </div>
                        </section>

                        <CartCrossSell
                            productIds={cartProductIds}
                            cartProductIds={cartProductIds}
                        />

                        <CartSummary
                            className="lg:hidden"
                            subtotal={subtotal}
                            deliveryFee={deliveryFee}
                            platformFee={PLATFORM_FEE}
                            discount={coupon.discount}
                            savings={totalSavings}
                            total={total}
                            itemCount={lineItemCount}
                            freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                        />
                    </div>

                    <aside className="hidden lg:block">
                        <div className="sticky top-[104px] space-y-4">
                            <CartSummary
                                subtotal={subtotal}
                                deliveryFee={deliveryFee}
                                platformFee={PLATFORM_FEE}
                                discount={coupon.discount}
                                savings={totalSavings}
                                total={total}
                                itemCount={lineItemCount}
                                onCheckout={() => router.push('/checkout')}
                                ctaLabel={`🔒 Secure Checkout • ${formatINR(total)}`}
                                promoContent={renderPromoBlock()}
                                freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                            />
                        </div>
                    </aside>
                </div>
            </div>

            <CartStickyBar
                itemCount={lineItemCount}
                total={total}
                savings={totalSavings}
                onCheckout={() => router.push('/checkout')}
            />

            <CouponSheet
                isOpen={showCouponSheet}
                onClose={() => setShowCouponSheet(false)}
                onApply={(code) => {
                    applyCoupon(code)
                    setShowCouponSheet(false)
                }}
                appliedCode={coupon.code}
                isValidating={isValidating}
                onRemove={removeCoupon}
            />

            <CartStoreSwitchDialog
                open={!!pendingCrossStore}
                currentStoreName={cartStore.storeName ?? 'Current store'}
                newStoreName={pendingCrossStore?.newStoreName ?? ''}
                onConfirm={confirmStoreSwitchAndAdd}
                onCancel={cancelStoreSwitch}
            />
        </>
    )
}
