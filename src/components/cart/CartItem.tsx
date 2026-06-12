'use client'

import type { KeyboardEvent } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Minus, Package2, Plus, Trash2 } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types/cart.types'
import {
    cartItemDiscountPercent,
    cartItemIsLowStock,
    cartItemOriginalPrice,
    cartItemStockLabel,
    cartItemUnitSavings,
} from './cart.utils'

interface CartItemProps {
    item: CartItemType
    onQtyChange: (qty: number) => void
    onRemove: () => void
}

export function CartItem({ item, onQtyChange, onRemove }: CartItemProps) {
    const reduceMotion = useReducedMotion()
    const maxQty = item.stockQuantity ?? 99
    const href = `/products/${item.slug ?? item.productId}`
    const originalPrice = cartItemOriginalPrice(item)
    const discount = cartItemDiscountPercent(item)
    const isDiscounted = originalPrice > item.price
    const isLowStock = cartItemIsLowStock(item)
    const stockLabel = cartItemStockLabel(item)
    const originalSubtotal = originalPrice * item.quantity

    const handleStepperKeyDown = (event: KeyboardEvent<HTMLDivElement>) => {
        if (event.key === 'ArrowRight' || event.key === 'ArrowUp') {
            event.preventDefault()
            if (item.quantity < maxQty) onQtyChange(item.quantity + 1)
        }

        if (event.key === 'ArrowLeft' || event.key === 'ArrowDown') {
            event.preventDefault()
            if (item.quantity > 1) onQtyChange(item.quantity - 1)
        }
    }

    return (
        <motion.article
            layout={!reduceMotion}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -40, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.26, ease: 'easeOut' }}
            className="group rounded-[22px] border border-[rgba(255,255,255,0.7)] bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(250,247,241,0.96)_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)] transition-all duration-200 hover:-translate-y-0.5 hover:border-[rgba(104,72,198,0.16)] hover:shadow-[0_18px_38px_rgba(15,23,42,0.08)]"
        >
            <div className="grid grid-cols-[96px_minmax(0,1fr)_132px] gap-4">
                <Link
                    href={href}
                    className="relative h-24 w-24 overflow-hidden rounded-xl border border-[rgba(255,255,255,0.7)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(242,237,228,0.95))]"
                >
                    <Image
                        src={item.image || '/placeholder-product.svg'}
                        alt={item.name}
                        fill
                        className="object-contain p-3"
                        sizes="96px"
                    />
                </Link>

                <div className="min-w-0">
                    <div className="flex items-start justify-between gap-3">
                        <div className="min-w-0">
                            <Link
                                href={href}
                                className="block text-[16px] font-semibold leading-[1.32] text-[#16202A] transition-colors hover:text-[color:var(--shop-primary)]"
                            >
                                <span className="line-clamp-2">{item.name}</span>
                            </Link>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <span className="inline-flex items-center gap-1 rounded-full bg-[rgba(104,72,198,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--shop-primary)]">
                                    <Package2 className="h-3 w-3" />
                                    {item.unit || 'Unit'}
                                </span>
                                <span
                                    className={`inline-flex items-center gap-1 rounded-full px-2.5 py-1 text-[11px] font-semibold ${
                                        item.inStock
                                            ? isLowStock
                                                ? 'bg-amber-50 text-amber-700'
                                                : 'bg-emerald-50 text-emerald-700'
                                            : 'bg-rose-50 text-rose-700'
                                    }`}
                                >
                                    <span
                                        className={`h-2 w-2 rounded-full ${
                                            item.inStock
                                                ? isLowStock
                                                    ? 'bg-amber-500'
                                                    : 'bg-emerald-500'
                                                : 'bg-rose-500'
                                        }`}
                                    />
                                    {stockLabel}
                                </span>
                            </div>

                            <div className="mt-2 flex flex-wrap items-center gap-2">
                                <p className="text-sm font-semibold text-[#166534]">{formatINR(item.price)} each</p>
                                {isDiscounted && (
                                    <span className="inline-flex rounded-full bg-[rgba(220,38,38,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--shop-discount)]">
                                        {discount > 0 ? `${discount}% OFF` : `Save ${formatINR(cartItemUnitSavings(item))}`}
                                    </span>
                                )}
                            </div>
                        </div>

                        <button
                            type="button"
                            onClick={onRemove}
                            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full text-[#B1B8BF] opacity-0 transition-all hover:bg-red-50 hover:text-red-500 focus-visible:opacity-100 group-hover:opacity-100"
                            aria-label={`Remove ${item.name} from cart`}
                        >
                            <Trash2 className="h-4 w-4" strokeWidth={1.7} />
                        </button>
                    </div>

                    <div className="mt-4 flex items-center justify-between gap-3">
                        <div
                            tabIndex={0}
                            onKeyDown={handleStepperKeyDown}
                            className="inline-flex items-center rounded-full border border-[rgba(22,101,52,0.16)] bg-white p-1 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[rgba(104,72,198,0.22)]"
                            aria-label={`Quantity for ${item.name}`}
                        >
                            <button
                                type="button"
                                onClick={() => onQtyChange(Math.max(1, item.quantity - 1))}
                                disabled={item.quantity <= 1}
                                className="flex h-9 w-9 items-center justify-center rounded-full text-[#166534] transition-colors hover:bg-[rgba(22,101,52,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Decrease quantity of ${item.name}`}
                            >
                                <Minus className="h-4 w-4" />
                            </button>
                            <motion.span
                                key={item.quantity}
                                initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                                animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
                                className="inline-flex min-w-[36px] justify-center text-sm font-semibold text-[#16202A]"
                            >
                                {item.quantity}
                            </motion.span>
                            <button
                                type="button"
                                onClick={() => onQtyChange(Math.min(maxQty, item.quantity + 1))}
                                disabled={item.quantity >= maxQty}
                                className="flex h-9 w-9 items-center justify-center rounded-full bg-[#166534] text-white transition-colors hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-40"
                                aria-label={`Increase quantity of ${item.name}`}
                            >
                                <Plus className="h-4 w-4" />
                            </button>
                        </div>

                        {isDiscounted && (
                            <p className="text-xs font-medium text-[#68737E]">
                                You save {formatINR(cartItemUnitSavings(item) * item.quantity)}
                            </p>
                        )}
                    </div>
                </div>

                <div className="flex flex-col items-end justify-between text-right">
                    <div className="min-h-9" />
                    <div>
                        <p className="text-[10px] font-semibold uppercase tracking-[0.18em] text-[#98A0A8]">
                            Subtotal
                        </p>
                        {isDiscounted && (
                            <p className="mt-1 text-xs font-medium text-[#A1A8AF] line-through">
                                {formatINR(originalSubtotal)}
                            </p>
                        )}
                        <motion.p
                            key={`${item.productId}-${item.quantity}`}
                            initial={reduceMotion ? false : { y: 10, opacity: 0 }}
                            animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
                            className="mt-1 text-[22px] font-bold tracking-[-0.04em] text-[#16202A]"
                        >
                            {formatINR(item.subtotal)}
                        </motion.p>
                    </div>
                </div>
            </div>
        </motion.article>
    )
}
