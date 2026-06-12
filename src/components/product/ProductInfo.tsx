'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { ArrowLeft, ChevronDown, RotateCcw, Shield, Sparkles, Truck, Users } from 'lucide-react'
import { AddToCartSection } from '@/components/product/AddToCartSection'
import { Button } from '@/components/ui/button'
import { useCart } from '@/hooks/useCart'
import { TrustRow } from '@/components/shared'
import { discountPercent, formatINR } from '@/lib/utils'
import { RatingStars } from '@/components/shared/RatingStars'
import type { Product } from '@/types/product.types'

interface ProductInfoProps {
    product: Product
    reviewSummary: {
        averageRating: number
        totalReviews: number
    }
}

const TRUSTED_BUYER_STYLES = [
    'bg-emerald-100 text-emerald-700',
    'bg-amber-100 text-amber-700',
    'bg-sky-100 text-sky-700',
    'bg-rose-100 text-rose-700',
]

export function ProductInfo({ product, reviewSummary }: ProductInfoProps) {
    const router = useRouter()
    const { addToCart } = useCart()
    const [descExpanded, setDescExpanded] = useState(false)

    const salePrice = product.sale_price ?? product.salePrice ?? null
    const isOnSale = salePrice !== null && salePrice < product.price
    const displayPrice = isOnSale ? salePrice : product.price
    const discount = isOnSale ? discountPercent(product.price, salePrice) : null
    const reviewCount = reviewSummary.totalReviews
    const averageRating = reviewSummary.averageRating
    const buyerCount = Math.max(
        reviewCount > 0 ? reviewCount * 3 : 0,
        Math.min(product.total_sold, 1200),
        product.stock_quantity > 0 ? 24 : 0,
    )

    const handleShopNow = () => {
        addToCart(product.id, 1)
        router.push('/cart')
    }

    return (
        <>
            <div className="flex items-center gap-2 -mt-1">
                <button
                    type="button"
                    onClick={() => router.back()}
                    className="flex h-9 w-9 items-center justify-center rounded-full border border-[color:var(--shop-border)] transition-colors hover:bg-gray-50"
                    aria-label="Go back"
                >
                    <ArrowLeft className="h-4 w-4 text-[color:var(--shop-ink-muted)]" strokeWidth={1.5} />
                </button>
                <nav className="flex items-center gap-1 text-xs text-gray-400">
                    <Link href="/" className="transition-colors hover:text-[color:var(--shop-primary)]">
                        Home
                    </Link>
                    <span>/</span>
                    {product.category_name ? (
                        <>
                            <Link
                                href="/categories"
                                className="transition-colors hover:text-[color:var(--shop-primary)]"
                            >
                                {product.category_name}
                            </Link>
                            <span>/</span>
                        </>
                    ) : null}
                    <span className="max-w-[200px] truncate font-medium text-[color:var(--shop-ink-muted)]">
                        {product.name}
                    </span>
                </nav>
            </div>

            <div>
                <p className="mb-1.5 text-xs font-medium uppercase tracking-wider text-[color:var(--shop-ink-muted)]">
                    {product.unit}
                </p>
                <h1 className="text-[28px] font-extrabold leading-[1.15] text-[color:var(--shop-ink)] lg:text-[32px]">
                    {product.name}
                </h1>
            </div>

            <div className="flex flex-wrap items-center gap-3 rounded-2xl border border-[color:var(--shop-border)] bg-white/80 px-4 py-3">
                <div className="flex items-center gap-2">
                    <RatingStars value={averageRating} size="sm" className="gap-1" />
                    <span className="text-sm font-semibold text-[color:var(--shop-ink)]">
                        {reviewCount > 0 ? averageRating.toFixed(1) : 'New'}
                    </span>
                    <a
                        href="#reviews"
                        className="text-sm text-[color:var(--shop-ink-muted)] transition-colors hover:text-[color:var(--shop-primary)]"
                    >
                        {reviewCount > 0 ? `(${reviewCount} reviews)` : 'See first reviews'}
                    </a>
                </div>

                <div className="hidden h-5 w-px bg-[color:var(--shop-border)] sm:block" />

                <div className="flex items-center gap-2">
                    <div className="flex items-center">
                        {TRUSTED_BUYER_STYLES.map((style, index) => (
                            <span
                                key={style}
                                className={`-ml-2 flex h-7 w-7 items-center justify-center rounded-full border-2 border-white text-[10px] font-bold first:ml-0 ${style}`}
                            >
                                {String.fromCharCode(65 + index)}
                            </span>
                        ))}
                    </div>
                    <span className="text-sm text-[color:var(--shop-ink-muted)]">
                        Trusted by {buyerCount > 999 ? `${(buyerCount / 1000).toFixed(1)}K` : buyerCount} buyers
                    </span>
                </div>
            </div>

            <div className="flex flex-wrap items-baseline gap-3">
                <span className="text-[28px] font-extrabold text-[color:var(--shop-ink)]">
                    {formatINR(displayPrice)}
                </span>
                {isOnSale && (
                    <span className="text-lg text-[color:var(--shop-ink-muted)] line-through">
                        {formatINR(product.price)}
                    </span>
                )}
                {discount && (
                    <span className="rounded-full bg-[var(--shop-seasonal-accent-wash)] px-3 py-1 text-[13px] font-semibold text-[color:var(--shop-primary)]">
                        You save {formatINR(product.price - displayPrice)} ({discount}%)
                    </span>
                )}
                <span className="text-xs font-medium text-[color:var(--shop-ink-muted)]">Per {product.unit}</span>
            </div>

            <div className="flex items-center gap-2">
                {product.stock_quantity > 0 ? (
                    <>
                        <div className="pulse-dot h-2 w-2 rounded-full bg-[color:var(--shop-primary)]" />
                        <span className="text-sm font-medium text-[color:var(--shop-primary)]">
                            {product.stock_quantity < 10
                                ? `Only ${product.stock_quantity} left — hurry!`
                                : 'In Stock'}
                        </span>
                    </>
                ) : (
                    <>
                        <div className="h-2 w-2 rounded-full bg-red-500" />
                        <span className="text-sm font-medium text-red-500">Out of Stock</span>
                    </>
                )}
            </div>

            <div className="space-y-3">
                <AddToCartSection product={product} />
                {product.stock_quantity > 0 && (
                    <Button
                        size="lg"
                        onClick={handleShopNow}
                        className="h-12 w-full rounded-xl bg-[color:var(--shop-primary)] text-base font-semibold text-white hover:bg-[color:var(--shop-primary-hover)]"
                    >
                        Shop Now - {formatINR(displayPrice)}
                    </Button>
                )}
            </div>

            <div className="grid gap-3 rounded-[24px] bg-[linear-gradient(135deg,#f0fdf4_0%,#ecfccb_100%)] p-4 text-sm text-[color:var(--shop-ink)] sm:grid-cols-3">
                <div className="flex items-center gap-2.5">
                    <Users className="h-4 w-4 text-[color:var(--shop-primary)]" strokeWidth={1.8} />
                    <span>{buyerCount > 999 ? `${(buyerCount / 1000).toFixed(1)}K` : buyerCount}+ bought this season</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <Sparkles className="h-4 w-4 text-[color:var(--shop-primary)]" strokeWidth={1.8} />
                    <span>{reviewCount > 10 ? 'Top rated by repeat buyers' : 'Fresh pick from curated inventory'}</span>
                </div>
                <div className="flex items-center gap-2.5">
                    <RotateCcw className="h-4 w-4 text-[color:var(--shop-primary)]" strokeWidth={1.8} />
                    <span>Quality issue? We make it right fast.</span>
                </div>
            </div>

            <TrustRow
                className="border-t border-[color:var(--shop-border)] pt-5"
                items={[
                    { icon: Truck, label: 'Free delivery above ₹299' },
                    { icon: RotateCcw, label: 'Easy 7-day returns' },
                    { icon: Shield, label: 'Freshness guaranteed' },
                ]}
            />

            {product.description && (
                <div className="border-t border-[color:var(--shop-border)] pt-5">
                    <h3 className="mb-2 text-sm font-bold text-[color:var(--shop-ink)]">About this product</h3>
                    <div className="relative">
                        <p
                            className={`text-sm leading-relaxed text-[color:var(--shop-ink-muted)] ${
                                !descExpanded ? 'line-clamp-3' : ''
                            }`}
                        >
                            {product.description}
                        </p>
                        {product.description.length > 150 && (
                            <button
                                type="button"
                                onClick={() => setDescExpanded((prev) => !prev)}
                                className="mt-1 flex items-center gap-0.5 text-xs font-semibold text-[color:var(--shop-primary)] hover:underline"
                            >
                                {descExpanded ? 'Show less' : 'Read more'}
                                <ChevronDown
                                    className={`h-3 w-3 transition-transform ${descExpanded ? 'rotate-180' : ''}`}
                                    strokeWidth={1.5}
                                />
                            </button>
                        )}
                    </div>
                </div>
            )}

            {(product.tags?.length ?? 0) > 0 && (
                <div className="flex flex-wrap gap-2">
                    {product.tags.map((tag) => (
                        <span key={tag} className="rounded-full bg-[var(--shop-seasonal-accent-wash)] px-3 py-1 text-xs text-[color:var(--shop-ink-muted)]">
                            {tag}
                        </span>
                    ))}
                </div>
            )}
        </>
    )
}
