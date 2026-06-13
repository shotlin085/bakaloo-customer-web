'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useQuery } from '@tanstack/react-query'
import { ArrowLeft, ChevronLeft, ShieldCheck } from 'lucide-react'
import {
    AddressStep,
    OrderSummaryPanel,
    PaymentStep,
    ReviewStep,
    StepIndicator,
    StickySummaryBar,
} from '@/components/checkout'
import { keys } from '@/lib/queryKeys'
import { useCart } from '@/hooks/useCart'
import { useCoupon } from '@/hooks/useCoupon'
import { loadRazorpay, openRazorpayCheckout } from '@/lib/razorpay'
import { formatINR } from '@/lib/utils'
import { useAuthStore } from '@/store/auth.store'
import { useCouponStore } from '@/store/coupon.store'
import { useStoreContext } from '@/store/store.context'
import { cartService } from '@/services/cart.service'
import { ordersService } from '@/services/orders.service'
import { paymentsService } from '@/services/payments.service'
import { walletService } from '@/services/wallet.service'
import { toast } from 'sonner'
import type { Address } from '@/types/address.types'
import type { PaymentMethod } from '@/types/order.types'

// Fee values are now served from the backend FeeSummary
const FREE_DELIVERY_THRESHOLD = 0
const DEFAULT_DELIVERY_FEE = 0
const PLATFORM_FEE = 0

type Step = 'address' | 'payment' | 'review'

const STEPS: Step[] = ['address', 'payment', 'review']
const STEP_LABELS: Record<Step, string> = {
    address: 'Address',
    payment: 'Payment',
    review: 'Review',
}

export default function CheckoutPage() {
    const router = useRouter()
    const user = useAuthStore((state) => state.user)
    const clearCoupon = useCouponStore((state) => state.clearCoupon)
    const allocatedStoreId = useStoreContext((s) => s.allocatedStoreId)
    const { cart } = useCart()

    const [step, setStep] = useState<Step>('address')
    const [selectedAddr, setSelectedAddr] = useState<Address | null>(null)
    const [paymentMethod, setPaymentMethod] = useState<PaymentMethod>('ONLINE')
    const [deliveryNotes, setDeliveryNotes] = useState('')
    const [isPlacing, setIsPlacing] = useState(false)

    const { data: walletBalanceData, isLoading: walletBalanceLoading } = useQuery({
        queryKey: keys.wallet(),
        queryFn: walletService.getBalance,
        enabled: !!user,
    })

    const walletBalance = walletBalanceData?.balance ?? 0
    const subtotal = cart?.subtotal ?? 0
    const { coupon } = useCoupon(subtotal)
    const couponDiscount = coupon.isValid ? Math.min(coupon.discount, subtotal) : 0
    const deliveryFee = subtotal >= FREE_DELIVERY_THRESHOLD ? 0 : DEFAULT_DELIVERY_FEE
    const total = Math.max(0, subtotal + deliveryFee + PLATFORM_FEE - couponDiscount)
    const stepIndex = STEPS.indexOf(step)
    const itemCount = cart?.items.length ?? 0

    useEffect(() => {
        document.title = 'Checkout — Bakaloo'
    }, [])

    useEffect(() => {
        if (paymentMethod === 'WALLET' && walletBalance < total) {
            setPaymentMethod('ONLINE')
        }
    }, [paymentMethod, total, walletBalance])

    const handlePlaceOrder = async () => {
        if (!selectedAddr) {
            toast.error('Please select an address')
            return
        }

        setIsPlacing(true)

        try {
            const validation = await cartService.validate()
            if (!validation.valid) {
                toast.error('Some items changed. Please review cart.')
                router.push('/cart')
                return
            }

            const order = await ordersService.place({
                addressId: selectedAddr.id,
                paymentMethod,
                couponCode: coupon.isValid ? coupon.code ?? undefined : undefined,
                deliveryNotes: deliveryNotes.trim() || undefined,
                storeId: allocatedStoreId ?? '',
            })

            if (paymentMethod === 'ONLINE') {
                await loadRazorpay()
                const razorpayOrder = await paymentsService.createOrder(order.id)

                await openRazorpayCheckout({
                    amount: razorpayOrder.amount,
                    currency: 'INR',
                    orderId: razorpayOrder.razorpayOrderId,
                    keyId: razorpayOrder.keyId,
                    userPhone: user?.phone ?? '',
                    userName: user?.name ?? '',
                    onSuccess: async (payment) => {
                        await paymentsService.verify({
                            razorpayOrderId: payment.razorpay_order_id,
                            razorpayPaymentId: payment.razorpay_payment_id,
                            razorpaySignature: payment.razorpay_signature,
                        })
                        clearCoupon()
                        router.push(`/checkout/success?orderId=${order.id}`)
                    },
                    onDismiss: () => {
                        setIsPlacing(false)
                        toast.error('Payment cancelled. Order saved — retry from Orders page.')
                    },
                })

                return
            }

            if (paymentMethod === 'WALLET') {
                const walletPayment = await walletService.pay(order.id)
                if (!walletPayment) {
                    setIsPlacing(false)
                    toast.error('Wallet payment failed. Please try again.')
                    return
                }
            }

            clearCoupon()
            router.push(`/checkout/success?orderId=${order.id}`)
        } catch {
            toast.error('Could not place order')
            setIsPlacing(false)
        }
    }

    const ctaLabel = getCheckoutCtaLabel(step, paymentMethod, total)
    const isPrimaryDisabled =
        step === 'address'
            ? !selectedAddr
            : step === 'review'
                ? !selectedAddr || isPlacing
                : false

    const handlePrimaryAction = () => {
        if (step === 'address') {
            if (!selectedAddr) return
            setStep('payment')
            return
        }

        if (step === 'payment') {
            setStep('review')
            return
        }

        void handlePlaceOrder()
    }

    const stepContent = {
        address: {
            eyebrow: 'Delivery',
            title: 'Choose where to deliver',
            description: 'Select a saved address or add a new one for this order.',
        },
        payment: {
            eyebrow: 'Payment',
            title: 'Choose how you want to pay',
            description: 'Pick a secure payment option and add any delivery note.',
        },
        review: {
            eyebrow: 'Review',
            title: 'Review before you place the order',
            description: 'Confirm your address, payment method, and final pricing.',
        },
    }[step]

    return (
        <div className="min-h-screen bg-slate-50 pb-28 lg:pb-10">
            <div className="page-enter mx-auto max-w-[1280px] px-4 py-6 sm:px-5 lg:px-6 lg:py-8">
                <div className="mb-6 flex items-center gap-4">
                    <button
                        onClick={() => router.back()}
                        className="flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-slate-200 bg-white text-slate-600 transition-colors hover:bg-slate-50"
                        aria-label="Go back"
                    >
                        <ArrowLeft className="h-4 w-4" />
                    </button>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">Secure Checkout</p>
                        <h1 className="mt-1 text-2xl font-semibold tracking-tight text-slate-950 sm:text-[30px]">
                            Complete your order
                        </h1>
                    </div>
                </div>

                <div className="mb-6 rounded-[28px] border border-slate-200 bg-white px-4 py-5 shadow-[0_16px_40px_rgba(15,23,42,0.05)] sm:px-6">
                    <StepIndicator steps={Object.values(STEP_LABELS)} currentStep={stepIndex} />
                </div>

                <div className="grid gap-6 lg:grid-cols-12 lg:items-start">
                    <div className="space-y-5 lg:col-span-7">
                        <section className="rounded-[28px] border border-slate-200 bg-white p-5 shadow-[0_20px_48px_rgba(15,23,42,0.06)] sm:p-6">
                            <div className="mb-6">
                                <p className="text-xs font-semibold uppercase tracking-[0.18em] text-slate-400">
                                    {stepContent.eyebrow}
                                </p>
                                <h2 className="mt-2 text-2xl font-semibold tracking-tight text-slate-950">
                                    {stepContent.title}
                                </h2>
                                <p className="mt-2 text-sm leading-6 text-slate-500">
                                    {stepContent.description}
                                </p>
                            </div>

                            {step === 'address' && (
                                <AddressStep
                                    selectedId={selectedAddr?.id ?? null}
                                    onSelect={setSelectedAddr}
                                />
                            )}

                            {step === 'payment' && (
                                <PaymentStep
                                    selected={paymentMethod}
                                    onSelect={setPaymentMethod}
                                    total={total}
                                    walletBalance={walletBalance}
                                    deliveryNotes={deliveryNotes}
                                    onDeliveryNotesChange={setDeliveryNotes}
                                    walletBalanceLoading={walletBalanceLoading}
                                />
                            )}

                            {step === 'review' && (
                                <ReviewStep
                                    items={cart?.items ?? []}
                                    address={selectedAddr}
                                    paymentMethod={paymentMethod}
                                    subtotal={subtotal}
                                    deliveryFee={deliveryFee}
                                    platformFee={PLATFORM_FEE}
                                    discount={couponDiscount}
                                    total={total}
                                    deliveryNotes={deliveryNotes.trim() || undefined}
                                />
                            )}
                        </section>

                        {step !== 'address' && (
                            <button
                                type="button"
                                onClick={() => setStep(step === 'payment' ? 'address' : 'payment')}
                                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-600 transition-colors hover:bg-slate-50"
                            >
                                <ChevronLeft className="h-4 w-4" />
                                {step === 'payment' ? 'Back to Address' : 'Back to Payment'}
                            </button>
                        )}
                    </div>

                    <aside className="hidden lg:col-span-5 lg:block">
                        <div className="sticky top-6 space-y-4">
                            <OrderSummaryPanel
                                subtotal={subtotal}
                                deliveryFee={deliveryFee}
                                platformFee={PLATFORM_FEE}
                                discount={couponDiscount}
                                total={total}
                                itemCount={itemCount}
                                ctaLabel={ctaLabel}
                                onAction={handlePrimaryAction}
                                actionDisabled={isPrimaryDisabled}
                                actionLoading={isPlacing}
                                freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                                stageLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
                            />

                            <div className="rounded-[24px] border border-green-200 bg-green-50/80 p-4">
                                <div className="flex items-center gap-3">
                                    <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-white text-green-600">
                                        <ShieldCheck className="h-5 w-5" />
                                    </div>
                                    <div>
                                        <p className="text-sm font-semibold text-slate-950">Trusted checkout</p>
                                        <p className="mt-1 text-sm text-slate-500">
                                            Clear pricing, protected payments, and support if plans change.
                                        </p>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </aside>
                </div>
            </div>

            <div className="lg:hidden">
                <StickySummaryBar
                    total={total}
                    itemCount={itemCount}
                    ctaLabel={ctaLabel}
                    onCtaClick={handlePrimaryAction}
                    disabled={isPrimaryDisabled}
                    loading={isPlacing}
                >
                    <OrderSummaryPanel
                        subtotal={subtotal}
                        deliveryFee={deliveryFee}
                        platformFee={PLATFORM_FEE}
                        discount={couponDiscount}
                        total={total}
                        itemCount={itemCount}
                        ctaLabel={ctaLabel}
                        onAction={handlePrimaryAction}
                        actionDisabled={isPrimaryDisabled}
                        actionLoading={isPlacing}
                        freeDeliveryThreshold={FREE_DELIVERY_THRESHOLD}
                        stageLabel={`Step ${stepIndex + 1} of ${STEPS.length}`}
                    />
                </StickySummaryBar>
            </div>
        </div>
    )
}

function getCheckoutCtaLabel(step: Step, paymentMethod: PaymentMethod, total: number) {
    if (step === 'address') return 'Continue to Payment'
    if (step === 'payment') return 'Continue to Review'

    if (paymentMethod === 'ONLINE') {
        return `Secure Payment • ${formatINR(total)}`
    }

    if (paymentMethod === 'WALLET') {
        return `Pay with Wallet • ${formatINR(total)}`
    }

    return `Place Order • ${formatINR(total)}`
}
