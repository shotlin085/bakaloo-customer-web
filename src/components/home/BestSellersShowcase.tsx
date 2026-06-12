'use client'

import { useMemo, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import { Heart, Plus, ShoppingBasket, Star } from 'lucide-react'
import { cn, discountPercent, formatINR } from '@/lib/utils'
import { useCart } from '@/hooks/useCart'
import { Skeleton } from '@/components/ui/skeleton'
import type { Product } from '@/types/product.types'

type BestSellersShowcaseProps = {
    products: Product[]
}

function displayPrice(product: Product) {
    return product.sale_price ?? product.price
}

function reviewCount(product: Product) {
    return Math.max(1, Math.min(99, Math.round((product.total_sold || 1) / 18)))
}

function splitProducts(products: Product[]) {
    const list = products.slice(0, 7)
    const spotlight = list[0]
    const side = list.slice(1)
    const left = side.slice(0, 3)
    const right = side.slice(3, 6)
    return { spotlight, left, right }
}

function StarRating({ count }: { count: number }) {
    return (
        <div className="flex items-center gap-1">
            {Array.from({ length: 5 }).map((_, index) => (
                <Star key={index} className="h-3.5 w-3.5 fill-[#EAB308] text-[#EAB308]" />
            ))}
            <span className="ml-1 text-xs font-medium text-[#6B7280]">{count}</span>
        </div>
    )
}

export function BestSellersShowcase({ products }: BestSellersShowcaseProps) {
    const { addToCart, isAdding } = useCart()
    const [liked, setLiked] = useState<Record<string, boolean>>({})
    const { spotlight, left, right } = useMemo(() => splitProducts(products), [products])

    if (!spotlight) return null

    const toggleLike = (id: string) => setLiked((prev) => ({ ...prev, [id]: !prev[id] }))
    const centerDiscount =
        spotlight.sale_price !== null && spotlight.sale_price < spotlight.price
            ? discountPercent(spotlight.price, spotlight.sale_price)
            : null
    const stockBase = Math.max(50, spotlight.max_order_qty ?? 50)
    const stockRatio = Math.max(0, Math.min(100, (spotlight.stock_quantity / stockBase) * 100))

    const renderSideItem = (product: Product) => {
        const discount =
            product.sale_price !== null && product.sale_price < product.price
                ? discountPercent(product.price, product.sale_price)
                : null

        return (
            <article key={product.id} className="border-b border-[#ECE9E2] py-4 last:border-b-0">
                <div className="grid grid-cols-[88px_1fr] gap-4">
                    <Link
                        href={`/products/${product.slug}`}
                        className="relative flex h-24 items-center justify-center overflow-hidden rounded-[20px] bg-[#F7F5F0]"
                    >
                        <Image
                            src={product.thumbnail_url || product.images?.[0] || '/placeholder-product.svg'}
                            alt={product.name}
                            fill
                            className="object-contain p-3"
                            sizes="88px"
                        />
                        {discount && (
                            <span className="absolute left-2 top-2 rounded-full bg-[color:var(--shop-discount)] px-2 py-0.5 text-[10px] font-semibold text-white">
                                {discount}% OFF
                            </span>
                        )}
                    </Link>

                    <div className="min-w-0">
                        <div className="mb-1.5 flex items-start justify-between gap-2">
                            <Link href={`/products/${product.slug}`} className="min-w-0">
                                <p className="line-clamp-2 text-[15px] font-semibold leading-[1.3] text-[#16202A]">
                                    {product.name}
                                </p>
                            </Link>
                            <button
                                type="button"
                                onClick={() => toggleLike(product.id)}
                                className="mt-0.5 text-[#97A0A9] transition-colors hover:text-[#DC2626]"
                                aria-label={liked[product.id] ? 'Remove from wishlist' : 'Add to wishlist'}
                            >
                                <Heart
                                    className={cn(
                                        'h-[17px] w-[17px]',
                                        liked[product.id] && 'fill-[#DC2626] text-[#DC2626]',
                                    )}
                                />
                            </button>
                        </div>

                        <StarRating count={reviewCount(product)} />

                        <div className="mt-2 flex items-end gap-2">
                            <span className="text-[28px] font-extrabold leading-none tracking-tight text-[#16202A]">
                                {formatINR(displayPrice(product))}
                            </span>
                            {discount && (
                                <span className="pb-0.5 text-[13px] font-medium text-[#8C949C] line-through">
                                    {formatINR(product.price)}
                                </span>
                            )}
                        </div>

                        <button
                            type="button"
                            onClick={() => addToCart(product.id, 1)}
                            disabled={isAdding || product.stock_quantity === 0}
                            className="mt-3 inline-flex h-10 w-full items-center justify-between rounded-full border border-[rgba(104,72,198,0.18)] bg-white px-3.5 text-[14px] font-semibold text-[color:var(--shop-primary)] transition-colors hover:bg-[rgba(104,72,198,0.06)] disabled:cursor-not-allowed disabled:opacity-55"
                        >
                            <span>{product.stock_quantity === 0 ? 'Out of stock' : 'Add to cart'}</span>
                            <Plus className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </article>
        )
    }

    return (
        <section className="frosted-panel rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,244,255,0.88)_100%)] p-4 shadow-[0_22px_48px_rgba(42,28,92,0.10)] sm:p-5 lg:p-6">
            <div className="mb-5 flex flex-wrap items-end gap-2">
                <h3 className="text-[30px] font-bold leading-none tracking-tight text-[#1A232B] sm:text-[34px]">
                    Best Sellers
                </h3>
                <p className="pb-0.5 text-sm text-[#66717C]">
                    Live best sellers surfaced with a more editorial premium retail treatment.
                </p>
            </div>

            <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)_1fr]">
                <div>{left.map(renderSideItem)}</div>

                <article className="flex h-full flex-col rounded-[30px] border border-[rgba(104,72,198,0.18)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(245,240,255,0.94)_100%)] p-5 shadow-[0_18px_36px_rgba(42,28,92,0.10)]">
                    <div className="mb-2 flex justify-between">
                        <span className="rounded-full bg-[rgba(104,72,198,0.10)] px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.16em] text-[color:var(--shop-primary)]">
                            Spotlight
                        </span>
                        <button
                            type="button"
                            onClick={() => toggleLike(spotlight.id)}
                            className="text-[#747C86] transition-colors hover:text-[#DC2626]"
                            aria-label={liked[spotlight.id] ? 'Remove from wishlist' : 'Add to wishlist'}
                        >
                            <Heart
                                className={cn(
                                    'h-5 w-5',
                                    liked[spotlight.id] && 'fill-[#DC2626] text-[#DC2626]',
                                )}
                            />
                        </button>
                    </div>

                    <Link href={`/products/${spotlight.slug}`} className="relative mb-4 block h-[236px] rounded-[24px] bg-white sm:h-[270px]">
                        <Image
                            src={spotlight.thumbnail_url || spotlight.images?.[0] || '/placeholder-product.svg'}
                            alt={spotlight.name}
                            fill
                            className="object-contain p-4"
                            sizes="(max-width: 1024px) 80vw, 420px"
                        />
                        {centerDiscount && (
                            <span className="absolute left-3 top-3 rounded-full bg-[color:var(--shop-discount)] px-2.5 py-1 text-xs font-semibold text-white">
                                {centerDiscount}% OFF
                            </span>
                        )}
                    </Link>

                    <StarRating count={reviewCount(spotlight)} />
                    <Link href={`/products/${spotlight.slug}`} className="mt-3 block">
                        <h4 className="line-clamp-2 text-[30px] font-bold leading-[1.1] tracking-tight text-[#16202A]">
                            {spotlight.name}
                        </h4>
                    </Link>

                    <div className="mt-3 flex items-end gap-3">
                        <span className="text-[34px] font-extrabold leading-none tracking-tight text-[#16202A]">
                            {formatINR(displayPrice(spotlight))}
                        </span>
                        {centerDiscount && (
                            <span className="pb-1 text-[15px] font-medium text-[#8C949C] line-through">
                                {formatINR(spotlight.price)}
                            </span>
                        )}
                    </div>

                    <p className="mt-3 line-clamp-3 text-[14px] leading-6 text-[#66717C]">
                        {spotlight.description || 'Premium pantry essential selected for freshness, consistency, and repeat purchase confidence.'}
                    </p>

                    <div className="mt-5 border-t border-[#E7E4DD] pt-4">
                        <p className="mb-2 text-xs font-medium uppercase tracking-[0.16em] text-[#8A9099]">
                            Running low
                        </p>
                        <div className="h-2 w-full rounded-full bg-[#E7E4DD]">
                            <div
                                className="h-full rounded-full bg-gradient-to-r from-[#E8C65A] via-[#D9911D] to-[color:var(--shop-primary)]"
                                style={{ width: `${stockRatio}%` }}
                            />
                        </div>
                        <p className="mt-2 text-sm text-[#56606B]">
                            available only:{' '}
                            <span className="text-lg font-bold text-[#16202A]">{spotlight.stock_quantity}</span>
                        </p>
                    </div>

                    <button
                        type="button"
                        onClick={() => addToCart(spotlight.id, 1)}
                        disabled={isAdding || spotlight.stock_quantity === 0}
                        className="mt-5 flex h-12 w-full items-center justify-center gap-2 rounded-full bg-[color:var(--shop-primary)] text-[15px] font-semibold text-white transition-colors hover:bg-[color:var(--shop-primary-hover)] disabled:cursor-not-allowed disabled:opacity-55"
                    >
                        <ShoppingBasket className="h-4 w-4" />
                        {spotlight.stock_quantity === 0 ? 'Out of stock' : 'Add to cart'}
                    </button>
                </article>

                <div>{right.map(renderSideItem)}</div>
            </div>
        </section>
    )
}

export function BestSellersShowcaseSkeleton() {
    return (
        <section className="frosted-panel rounded-[30px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.92)_0%,rgba(248,244,255,0.88)_100%)] p-4 shadow-[0_22px_48px_rgba(42,28,92,0.10)] sm:p-5 lg:p-6">
            <div className="mb-5 flex items-center gap-3">
                <Skeleton className="h-8 w-40 rounded" />
                <Skeleton className="h-4 w-64 rounded" />
            </div>
            <div className="grid gap-5 lg:grid-cols-[1fr_minmax(320px,420px)_1fr]">
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-[20px]" />
                    ))}
                </div>
                <div className="rounded-[28px] border border-[#E7E2D7] p-5">
                    <Skeleton className="mb-4 h-64 w-full rounded-[24px]" />
                    <Skeleton className="mb-2 h-4 w-24 rounded" />
                    <Skeleton className="mb-3 h-8 w-4/5 rounded" />
                    <Skeleton className="mb-4 h-4 w-full rounded" />
                    <Skeleton className="h-12 w-full rounded-full" />
                </div>
                <div className="space-y-4">
                    {Array.from({ length: 3 }).map((_, i) => (
                        <Skeleton key={i} className="h-32 w-full rounded-[20px]" />
                    ))}
                </div>
            </div>
        </section>
    )
}
