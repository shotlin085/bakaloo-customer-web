'use client'

import type { KeyboardEvent } from 'react'
import { useState } from 'react'
import Image from 'next/image'
import Link from 'next/link'
import { motion, useReducedMotion } from 'framer-motion'
import { Minus, Package2, Plus, Trash2, X } from 'lucide-react'
import { formatINR } from '@/lib/utils'
import type { CartItem as CartItemType } from '@/types/cart.types'
import {
    cartItemDiscountPercent,
    cartItemIsLowStock,
    cartItemOriginalPrice,
    cartItemStockLabel,
} from './cart.utils'

interface CartItemMobileProps {
    item: CartItemType
    onQtyChange: (qty: number) => void
    onRemove: () => void
}

export function CartItemMobile({ item, onQtyChange, onRemove }: CartItemMobileProps) {
    const reduceMotion = useReducedMotion()
    const [deleteOpen, setDeleteOpen] = useState(false)
    const maxQty = item.stockQuantity ?? 99
    const href = `/products/${item.slug ?? item.productId}`
    const originalPrice = cartItemOriginalPrice(item)
    const isDiscounted = originalPrice > item.price
    const discount = cartItemDiscountPercent(item)
    const isLowStock = cartItemIsLowStock(item)
    const stockLabel = cartItemStockLabel(item)

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
        <motion.div
            layout={!reduceMotion}
            initial={reduceMotion ? false : { opacity: 0, y: 18 }}
            animate={reduceMotion ? undefined : { opacity: 1, y: 0 }}
            exit={reduceMotion ? { opacity: 0 } : { opacity: 0, x: -32, height: 0, marginBottom: 0 }}
            transition={{ duration: 0.24, ease: 'easeOut' }}
            className="relative overflow-hidden rounded-[22px] bg-[linear-gradient(90deg,#F87171_0%,#EF4444_100%)]"
        >
            <div className="absolute inset-y-0 right-0 flex w-24 items-center justify-center">
                <button
                    type="button"
                    onClick={onRemove}
                    className="inline-flex min-h-11 min-w-11 items-center justify-center gap-2 rounded-full px-4 text-sm font-semibold text-white"
                    aria-label={`Delete ${item.name} from cart`}
                >
                    <Trash2 className="h-4 w-4" />
                    Delete
                </button>
            </div>

            <motion.article
                drag="x"
                dragMomentum={false}
                dragElastic={0.06}
                dragConstraints={{ left: -92, right: 0 }}
                onDragEnd={(_, info) => {
                    setDeleteOpen(info.offset.x < -72)
                }}
                animate={{ x: deleteOpen ? -92 : 0 }}
                onTap={() => {
                    if (deleteOpen) setDeleteOpen(false)
                }}
                className="relative z-10 rounded-[22px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.98)_0%,rgba(248,246,241,0.98)_100%)] p-4 shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
            >
                <button
                    type="button"
                    onClick={onRemove}
                    className="absolute right-3 top-3 flex h-11 w-11 items-center justify-center rounded-full bg-[#EEF1F3] text-[#7C8791] transition-colors hover:bg-red-50 hover:text-red-500"
                    aria-label={`Remove ${item.name} from cart`}
                >
                    <X className="h-4 w-4" />
                </button>

                <div className="flex gap-3">
                    <Link
                        href={href}
                        className="relative h-20 w-20 shrink-0 overflow-hidden rounded-[18px] border border-[rgba(255,255,255,0.7)] bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.96),rgba(242,237,228,0.95))]"
                    >
                        <Image
                            src={item.image || '/placeholder-product.svg'}
                            alt={item.name}
                            fill
                            className="object-contain p-2.5"
                            sizes="80px"
                        />
                    </Link>

                    <div className="min-w-0 flex-1 pr-10">
                        <div className="mb-2 flex flex-wrap items-center gap-2">
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

                        <Link href={href} className="block text-[16px] font-semibold leading-[1.28] text-[#16202A]">
                            <span className="line-clamp-2">{item.name}</span>
                        </Link>
                        <p className="mt-1.5 text-sm font-semibold text-[#166534]">{formatINR(item.price)} each</p>

                        {isDiscounted && (
                            <div className="mt-2">
                                <span className="inline-flex rounded-full bg-[rgba(220,38,38,0.08)] px-2.5 py-1 text-[11px] font-semibold text-[color:var(--shop-discount)]">
                                    {discount}% OFF
                                </span>
                            </div>
                        )}

                        <div className="mt-4 flex items-end justify-between gap-3">
                            <div>
                                {isDiscounted && (
                                    <p className="text-xs font-medium text-[#A1A8AF] line-through">
                                        {formatINR(originalPrice * item.quantity)}
                                    </p>
                                )}
                                <motion.p
                                    key={`${item.productId}-${item.quantity}`}
                                    initial={reduceMotion ? false : { y: 8, opacity: 0 }}
                                    animate={reduceMotion ? undefined : { y: 0, opacity: 1 }}
                                    className="mt-1 text-[22px] font-bold tracking-[-0.04em] text-[#16202A]"
                                >
                                    {formatINR(item.subtotal)}
                                </motion.p>
                            </div>

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
                                    className="flex h-10 w-10 items-center justify-center rounded-full text-[#166534] transition-colors hover:bg-[rgba(22,101,52,0.08)] disabled:cursor-not-allowed disabled:opacity-40"
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
                                    className="flex h-10 w-10 items-center justify-center rounded-full bg-[#166534] text-white transition-colors hover:bg-[#14532D] disabled:cursor-not-allowed disabled:opacity-40"
                                    aria-label={`Increase quantity of ${item.name}`}
                                >
                                    <Plus className="h-4 w-4" />
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </motion.article>
        </motion.div>
    )
}
