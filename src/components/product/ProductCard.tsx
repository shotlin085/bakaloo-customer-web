'use client'

import React from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Loader2, Minus, Plus, ShoppingBasket, Star } from 'lucide-react'
import { motion } from 'framer-motion'
import { useCart } from '@/hooks/useCart'
import { WishlistButton } from '@/components/product/WishlistButton'
import { discountPercent, formatINR, cn } from '@/lib/utils'
import type { Product } from '@/types/product.types'

interface Props {
    product: Product
    showNewBadge?: boolean
    priority?: boolean
    variant?: 'default' | 'section'
}

function formatUnitLabel(unit: Product['unit']) {
    const map: Record<Product['unit'], string> = {
        kg: '1 Kg',
        g: '500 g',
        l: '1 L',
        ml: '500 ml',
        piece: '1 Piece',
        pack: '1 Pack',
    }
    return map[unit] ?? '1 Piece'
}

function formatBadgeUnit(unit: Product['unit']) {
    const map: Record<Product['unit'], string> = {
        kg: '1kg',
        g: '500g',
        l: '1L',
        ml: '500ml',
        piece: '1pc',
        pack: '1pack',
    }
    return map[unit] ?? '1pc'
}

function formatTagLabel(product: Product) {
    const raw = product.tags?.[0]?.trim()
    if (!raw) return 'Curated Grocery'
    return raw
        .replace(/[-_]+/g, ' ')
        .replace(/\s+/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase())
}

function reviewScore(product: Product) {
    const sold = Math.max(1, product.total_sold || 1)
    return Math.min(5, Math.max(4.1, 4 + sold / 200)).toFixed(1)
}

function ProductRating({ product }: { product: Product }) {
    return (
        <div className="flex items-center gap-1.5">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-[#EAB308] text-[#EAB308]" />
            ))}
            <span className="text-[12px] font-medium text-[#6D7680]">({reviewScore(product)})</span>
        </div>
    )
}

function ProductAction({
    product,
    qty,
    max,
    outOfStock,
    isAdding,
    isUpdating,
    addToCart,
    updateQty,
    removeFromCart,
}: {
    product: Product
    qty: number
    max: number
    outOfStock: boolean
    isAdding: boolean
    isUpdating: boolean
    addToCart: (productId: string, qty?: number) => void
    updateQty: (productId: string, qty: number) => void
    removeFromCart: (productId: string) => void
}) {
    if (outOfStock) {
        return (
            <span className="inline-flex h-10 items-center rounded-full bg-[#EEF1F3] px-4 text-[12px] font-semibold text-[#7A838C]">
                Out of stock
            </span>
        )
    }

    if (qty === 0) {
        return (
            <button
                type="button"
                onClick={(event) => {
                    event.preventDefault()
                    event.stopPropagation()
                    addToCart(product.id, 1)
                }}
                disabled={isAdding}
                className="inline-flex h-11 items-center justify-center gap-2 rounded-full bg-[color:var(--shop-primary)] px-4 text-[13px] font-semibold text-white shadow-[0_12px_24px_rgba(104,72,198,0.22)] transition-colors hover:bg-[color:var(--shop-primary-hover)] disabled:cursor-not-allowed disabled:opacity-55"
                aria-label={`Add ${product.name} to cart`}
            >
                {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBasket className="h-4 w-4" />}
                Add
            </button>
        )
    }

    return (
        <div
            className="inline-flex h-11 items-center gap-1 rounded-full border border-[rgba(104,72,198,0.16)] bg-[rgba(104,72,198,0.08)] px-1"
            onClick={(event) => {
                event.preventDefault()
                event.stopPropagation()
            }}
        >
            <button
                type="button"
                onClick={() => (qty === 1 ? removeFromCart(product.id) : updateQty(product.id, qty - 1))}
                disabled={isUpdating}
                className="flex h-9 w-9 items-center justify-center rounded-full text-[color:var(--shop-primary)] transition-colors hover:bg-white/80 disabled:opacity-40"
                aria-label={`Decrease quantity of ${product.name}`}
            >
                <Minus className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
            <span className="min-w-[18px] text-center text-[13px] font-bold text-[#16202A]">{qty}</span>
            <button
                type="button"
                onClick={() => {
                    if (qty < max) updateQty(product.id, qty + 1)
                }}
                disabled={isUpdating || qty >= max}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-[color:var(--shop-primary)] text-white transition-colors hover:bg-[color:var(--shop-primary-hover)] disabled:opacity-40"
                aria-label={`Increase quantity of ${product.name}`}
            >
                <Plus className="h-3.5 w-3.5" strokeWidth={2.4} />
            </button>
        </div>
    )
}

export const ProductCard = React.memo(function ProductCard({
    product,
    showNewBadge,
    priority = false,
    variant = 'default',
}: Props) {
    const { addToCart, updateQty, removeFromCart, getQty, isAdding, isUpdating } = useCart()
    const qty = getQty(product.id)
    const displayPrice = product.sale_price ?? product.price
    const discount =
        product.sale_price !== null && product.sale_price < product.price
            ? discountPercent(product.price, product.sale_price)
            : null
    const max = product.max_order_qty ?? Math.min(product.stock_quantity, 10)
    const outOfStock = product.stock_quantity === 0
    const displayTag = formatTagLabel(product)

    const imageSrc = product.thumbnail_url || product.images?.[0] || '/placeholder-product.svg'

    if (variant === 'section') {
        return (
            <motion.article
                whileHover={{ y: -4 }}
                transition={{ type: 'spring', stiffness: 320, damping: 24 }}
                className="group relative flex h-full flex-col rounded-[26px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(247,243,255,0.94)_100%)] p-4 shadow-[0_14px_32px_rgba(42,28,92,0.08)] transition-shadow duration-200 hover:shadow-[0_20px_38px_rgba(42,28,92,0.14)]"
            >
                <div className="mb-3 flex items-center justify-between gap-2">
                    <span className="max-w-[70%] truncate rounded-full bg-[rgba(104,72,198,0.08)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--shop-primary)]">
                        {displayTag}
                    </span>
                    <WishlistButton productId={product.id} className="h-9 w-9 rounded-full border-white/80 bg-white/92" />
                </div>

                <Link href={`/products/${product.slug}`} className="block">
                    <div className="relative h-[146px] overflow-hidden rounded-[22px] bg-[linear-gradient(180deg,rgba(248,245,255,0.98)_0%,rgba(255,255,255,0.94)_100%)]">
                        {discount && (
                            <span className="absolute left-3 top-3 z-10 rounded-full bg-[color:var(--shop-discount)] px-2.5 py-1 text-[10px] font-semibold text-white">
                                {discount}% OFF
                            </span>
                        )}
                        {!discount && showNewBadge && (
                            <span className="absolute left-3 top-3 z-10 rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-semibold text-white">
                                New
                            </span>
                        )}
                        <Image
                            src={imageSrc}
                            alt={product.name}
                            fill
                            className={cn(
                                'object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]',
                                outOfStock && 'opacity-45 grayscale-[0.7]',
                            )}
                            sizes="(max-width: 640px) 214px, (max-width: 1024px) 228px, 244px"
                            priority={priority}
                        />
                        {outOfStock && (
                            <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-white/78">
                                <span className="text-sm font-semibold text-[#6B7280]">Out of stock</span>
                            </div>
                        )}
                    </div>
                </Link>

                <div className="mt-4 flex flex-1 flex-col">
                    <div className="mb-2 flex items-center gap-2">
                        <span className="inline-flex rounded-full border border-[#E1E5E8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5F6972]">
                            {formatBadgeUnit(product.unit)}
                        </span>
                    </div>

                    <Link href={`/products/${product.slug}`} className="block">
                        <p className="line-clamp-2 text-[17px] font-semibold leading-[1.28] tracking-tight text-[#16202A]">
                            {product.name}
                        </p>
                    </Link>
                    <p className="mt-1 text-[13px] font-medium text-[#89939D]">{formatUnitLabel(product.unit)}</p>

                    <div className="mt-3">
                        <ProductRating product={product} />
                    </div>

                    <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                        <div className="min-w-0">
                            <p className="text-[26px] font-extrabold leading-none tracking-tight text-[#16202A]">
                                {formatINR(displayPrice)}
                            </p>
                            {discount && (
                                <p className="mt-1 text-[12px] font-medium text-[#9AA1A9] line-through">
                                    {formatINR(product.price)}
                                </p>
                            )}
                        </div>

                        <ProductAction
                            product={product}
                            qty={qty}
                            max={max}
                            outOfStock={outOfStock}
                            isAdding={isAdding}
                            isUpdating={isUpdating}
                            addToCart={addToCart}
                            updateQty={updateQty}
                            removeFromCart={removeFromCart}
                        />
                    </div>
                </div>
            </motion.article>
        )
    }

    return (
        <motion.article
            whileHover={{ y: -3 }}
            transition={{ type: 'spring', stiffness: 320, damping: 24 }}
            className="group relative flex h-full flex-col rounded-[24px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(247,243,255,0.96)_100%)] p-4 shadow-[0_12px_28px_rgba(42,28,92,0.08)] transition-shadow duration-200 hover:shadow-[0_18px_34px_rgba(42,28,92,0.12)]"
        >
                <div className="mb-3 flex items-start justify-between gap-3">
                <div>
                    {discount ? (
                        <span className="rounded-full bg-[color:var(--shop-discount)] px-2.5 py-1 text-[10px] font-semibold text-white">
                            {discount}% OFF
                        </span>
                    ) : showNewBadge ? (
                        <span className="rounded-full bg-[#111827] px-2.5 py-1 text-[10px] font-semibold text-white">
                            New
                        </span>
                    ) : (
                        <span className="rounded-full bg-[rgba(104,72,198,0.08)] px-2.5 py-1 text-[11px] font-semibold uppercase tracking-[0.12em] text-[color:var(--shop-primary)]">
                            {displayTag}
                        </span>
                    )}
                </div>
                <WishlistButton productId={product.id} className="opacity-100 transition-opacity duration-200 sm:opacity-0 sm:group-hover:opacity-100 sm:focus-visible:opacity-100" />
            </div>

            <Link href={`/products/${product.slug}`} className="block">
                <div className="relative mb-4 h-[144px] rounded-[22px] bg-[linear-gradient(180deg,rgba(248,245,255,0.98)_0%,rgba(255,255,255,0.94)_100%)]">
                    <Image
                        src={imageSrc}
                        alt={product.name}
                        fill
                        className={cn(
                            'object-contain p-4 transition-transform duration-300 group-hover:scale-[1.03]',
                            outOfStock && 'opacity-45 grayscale-[0.7]',
                        )}
                        sizes="(max-width: 640px) 45vw, (max-width: 1200px) 22vw, 220px"
                        priority={priority}
                    />
                    {outOfStock && (
                        <div className="pointer-events-none absolute inset-0 z-20 flex items-center justify-center rounded-[22px] bg-white/76">
                            <span className="text-sm font-semibold text-[#6B7280]">Out of stock</span>
                        </div>
                    )}
                </div>
            </Link>

            <div className="flex flex-1 flex-col">
                <div className="mb-2 flex items-center gap-2">
                    <span className="inline-flex rounded-full border border-[#E1E5E8] bg-white px-2.5 py-1 text-[11px] font-medium text-[#5F6972]">
                        {formatBadgeUnit(product.unit)}
                    </span>
                </div>

                <Link href={`/products/${product.slug}`} className="block">
                    <p className="line-clamp-2 text-[17px] font-semibold leading-tight tracking-tight text-[#16202A]">
                        {product.name}
                    </p>
                </Link>
                <p className="mt-1 text-[13px] font-medium text-[#89939D]">{formatUnitLabel(product.unit)}</p>

                <div className="mt-3">
                    <ProductRating product={product} />
                </div>

                <div className="mt-auto flex items-end justify-between gap-3 pt-4">
                    <div className="min-w-0">
                        <p className="text-[28px] font-extrabold leading-none tracking-tight text-[#16202A]">
                            {formatINR(displayPrice)}
                        </p>
                        {discount && (
                            <p className="mt-1 text-[12px] font-medium text-[#9AA1A9] line-through">
                                {formatINR(product.price)}
                            </p>
                        )}
                    </div>

                    <ProductAction
                        product={product}
                        qty={qty}
                        max={max}
                        outOfStock={outOfStock}
                        isAdding={isAdding}
                        isUpdating={isUpdating}
                        addToCart={addToCart}
                        updateQty={updateQty}
                        removeFromCart={removeFromCart}
                    />
                </div>
            </div>
        </motion.article>
    )
})
