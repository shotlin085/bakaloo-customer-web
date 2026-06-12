'use client'

import Image from 'next/image'
import { CreditCard, MapPin, ShieldCheck } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import { PriceBreakdown } from './PriceBreakdown'
import { TrustBadge } from './TrustBadge'
import type { Address } from '@/types/address.types'
import type { CartItem } from '@/types/cart.types'
import type { PaymentMethod } from '@/types/order.types'

type CartItemExtended = CartItem & {
    id?: string
    thumbnail_url?: string | null
}

interface ReviewStepProps {
    items: CartItem[]
    address: Address | null
    paymentMethod: PaymentMethod
    subtotal: number
    deliveryFee: number
    platformFee: number
    discount: number
    total: number
    deliveryNotes?: string
}

export function ReviewStep({
    items,
    address,
    paymentMethod,
    subtotal,
    deliveryFee,
    platformFee,
    discount,
    total,
    deliveryNotes,
}: ReviewStepProps) {
    return (
        <div className="space-y-5">
            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <div className="mb-4 flex items-center justify-between">
                    <div>
                        <p className="text-sm font-semibold text-slate-950">Items in this order</p>
                        <p className="mt-1 text-sm text-slate-500">
                            Final review before you confirm payment.
                        </p>
                    </div>
                    <span className="rounded-full bg-slate-100 px-3 py-1 text-xs font-semibold text-slate-500">
                        {items.length} items
                    </span>
                </div>

                <div className="space-y-3">
                    {items.map((item) => {
                        const itemData = item as CartItemExtended
                        return (
                            <div
                                key={item.productId || itemData.id}
                                className="flex items-center gap-3 rounded-2xl border border-slate-200 bg-slate-50/80 p-3"
                            >
                                <div className="relative h-14 w-14 shrink-0 overflow-hidden rounded-xl bg-white">
                                    <Image
                                        src={item.image || itemData.thumbnail_url || '/placeholder-product.svg'}
                                        alt={item.name}
                                        fill
                                        className="object-contain p-1.5"
                                        sizes="56px"
                                    />
                                </div>

                                <div className="min-w-0 flex-1">
                                    <p className="truncate text-sm font-semibold text-slate-950">{item.name}</p>
                                    <p className="mt-1 text-xs text-slate-500">Quantity: {item.quantity}</p>
                                </div>

                                <p className="text-sm font-bold text-slate-950">
                                    {formatINR(item.subtotal)}
                                </p>
                            </div>
                        )
                    })}
                </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
                {address && (
                    <div className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                        <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-green-50 text-green-600">
                            <MapPin className="h-5 w-5" strokeWidth={1.8} />
                        </div>
                        <div>
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Deliver to</p>
                            <p className="mt-2 text-sm font-semibold text-slate-950">{address.label ?? 'Delivery'}</p>
                            <p className="mt-1 text-sm text-slate-500">
                                {address.address_line1}, {address.city} - {address.pincode}
                            </p>
                        </div>
                    </div>
                )}

                <div className="flex items-start gap-3 rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                    <div className="flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-blue-50 text-blue-600">
                        <CreditCard className="h-5 w-5" strokeWidth={1.8} />
                    </div>
                    <div>
                        <p className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-400">Payment method</p>
                        <p className="mt-2 text-sm font-semibold text-slate-950">
                            {paymentMethod === 'ONLINE'
                                ? 'Pay Online'
                                : paymentMethod === 'WALLET'
                                    ? 'Wallet'
                                    : 'Cash on Delivery'}
                        </p>
                        {deliveryNotes && (
                            <p className="mt-1 text-sm text-slate-500">{deliveryNotes}</p>
                        )}
                    </div>
                </div>
            </div>

            <div className="rounded-[24px] border border-slate-200 bg-white p-5 shadow-[0_10px_24px_rgba(15,23,42,0.04)]">
                <PriceBreakdown
                    subtotal={subtotal}
                    deliveryFee={deliveryFee}
                    platformFee={platformFee}
                    discount={discount}
                    total={total}
                    itemCount={items.length}
                    showProgress={false}
                />
            </div>

            <div className="grid gap-3 rounded-[24px] border border-slate-200 bg-slate-50/70 p-4 sm:grid-cols-2">
                <TrustBadge
                    icon={ShieldCheck}
                    label="Secure confirmation"
                    subtext="Your payment and order details are protected"
                />
                <TrustBadge
                    icon={ShieldCheck}
                    label="No hidden charges"
                    subtext="Every fee is shown before you confirm"
                />
            </div>
        </div>
    )
}
