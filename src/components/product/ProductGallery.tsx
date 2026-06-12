'use client'

import { useEffect, useState } from 'react'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, Search, Sparkles, X } from 'lucide-react'
import { WishlistButton } from '@/components/product/WishlistButton'
import { ShareButton } from '@/components/shared/ShareButton'
import { discountPercent } from '@/lib/utils'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'
import type { Product } from '@/types/product.types'

interface ProductGalleryProps {
    product: Product
}

export function ProductGallery({ product }: ProductGalleryProps) {
    const [activeIdx, setActiveIdx] = useState(0)
    const [zoomOpen, setZoomOpen] = useState(false)
    const { addViewed } = useRecentlyViewed()

    useEffect(() => {
        if (product?.id) addViewed(product.id)
    }, [product?.id, addViewed])

    const images =
        product.images?.length > 0 ? product.images : [product.thumbnail_url || '/placeholder-product.svg']
    const mainImage = images[activeIdx] || images[0] || '/placeholder-product.svg'

    const salePrice = product.sale_price ?? product.salePrice ?? null
    const isOnSale = salePrice !== null && salePrice < product.price
    const discount = isOnSale ? discountPercent(product.price, salePrice) : null
    const isFreshArrival = Date.now() - new Date(product.created_at).getTime() < 1000 * 60 * 60 * 24 * 14
    const isOrganic =
        product.tags?.some((tag) => tag.toLowerCase().includes('organic')) ||
        product.certifications?.some((cert) => cert.toLowerCase().includes('organic'))

    const prevImage = () => setActiveIdx((idx) => (idx > 0 ? idx - 1 : images.length - 1))
    const nextImage = () => setActiveIdx((idx) => (idx < images.length - 1 ? idx + 1 : 0))

    return (
        <>
            <div className="group relative overflow-hidden rounded-[28px] border border-[color:var(--shop-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,239,0.98)_100%)] shadow-[var(--shop-shadow-soft)]">
                <div className="relative h-[300px] w-full sm:h-[400px] lg:h-[450px]">
                    <Image
                        src={mainImage}
                        alt={product.name}
                        fill
                        className="object-contain p-8"
                        priority
                        sizes="(max-width: 768px) 100vw, 55vw"
                    />

                    <button
                        type="button"
                        onClick={() => setZoomOpen(true)}
                        className="absolute inset-0 z-0"
                        aria-label={`Zoom image of ${product.name}`}
                    />

                    <div className="absolute left-4 top-4 z-10 flex flex-col gap-2">
                        {discount && (
                            <div className="rounded-lg bg-[color:var(--shop-discount)] px-3 py-1.5 text-sm font-bold text-white shadow-md">
                                {discount}% OFF
                            </div>
                        )}
                        {isFreshArrival && (
                            <div className="rounded-lg bg-emerald-500 px-3 py-1.5 text-xs font-bold uppercase tracking-wide text-white shadow-md">
                                New
                            </div>
                        )}
                        {isOrganic && (
                            <div className="inline-flex items-center gap-1.5 rounded-lg bg-green-100 px-3 py-1.5 text-xs font-semibold uppercase tracking-wide text-green-700 shadow-sm">
                                <Sparkles className="h-3.5 w-3.5" strokeWidth={1.8} />
                                Certified Organic
                            </div>
                        )}
                    </div>

                    <div className="absolute right-4 top-4 z-10 flex gap-2">
                        <WishlistButton productId={product.id} className="h-10 w-10" />
                        <ShareButton
                            title={product.name}
                            text={`Check out ${product.name} on Bakaloo!`}
                            url={`/products/${product.slug}`}
                        />
                    </div>

                    <div className="absolute bottom-4 right-4 z-10 hidden items-center gap-1.5 rounded-full bg-white/85 px-3 py-1.5 text-[11px] font-medium text-gray-500 shadow-sm backdrop-blur md:flex">
                        <Search className="h-3.5 w-3.5" strokeWidth={1.8} />
                        Click to zoom
                    </div>

                    {images.length > 1 && (
                        <>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    prevImage()
                                }}
                                className="absolute left-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--shop-border)] bg-white/80 text-[color:var(--shop-ink-muted)] opacity-0 backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100"
                                aria-label="Previous product image"
                            >
                                <ChevronLeft className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                            <button
                                type="button"
                                onClick={(event) => {
                                    event.stopPropagation()
                                    nextImage()
                                }}
                                className="absolute right-3 top-1/2 z-10 flex h-9 w-9 -translate-y-1/2 items-center justify-center rounded-full border border-[color:var(--shop-border)] bg-white/80 text-[color:var(--shop-ink-muted)] opacity-0 backdrop-blur transition-opacity hover:bg-white group-hover:opacity-100"
                                aria-label="Next product image"
                            >
                                <ChevronRight className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </>
                    )}
                </div>
            </div>

            {images.length > 1 && (
                <div className="scrollbar-hide mt-3 flex gap-2 overflow-x-auto">
                    {images.slice(0, 5).map((img, index) => (
                        <button
                            key={`${img}-${index}`}
                            type="button"
                            onClick={() => setActiveIdx(index)}
                            className={`h-16 w-16 flex-shrink-0 overflow-hidden rounded-xl border-2 transition-colors ${
                                activeIdx === index
                                    ? 'border-[color:var(--shop-primary)] shadow-[0_0_0_2px_rgba(34,197,94,0.15)]'
                                    : 'border-[color:var(--shop-border)] hover:border-[#CDD7D3]'
                            }`}
                            aria-label={`Show image ${index + 1}`}
                        >
                            <Image
                                src={img}
                                alt={`${product.name} ${index + 1}`}
                                width={64}
                                height={64}
                                className="object-contain p-1"
                            />
                        </button>
                    ))}
                </div>
            )}

            {zoomOpen && (
                <div
                    className="fixed inset-0 z-[320] bg-black/80 p-4 backdrop-blur-sm"
                    onClick={() => setZoomOpen(false)}
                >
                    <div className="mx-auto flex h-full w-full max-w-5xl flex-col" onClick={(event) => event.stopPropagation()}>
                        <div className="mb-3 flex justify-end">
                            <button
                                type="button"
                                onClick={() => setZoomOpen(false)}
                                className="flex h-10 w-10 items-center justify-center rounded-full bg-white/10 text-white transition-colors hover:bg-white/20"
                                aria-label="Close image zoom"
                            >
                                <X className="h-5 w-5" strokeWidth={1.8} />
                            </button>
                        </div>
                        <div className="relative flex-1 overflow-hidden rounded-[28px] border border-white/10 bg-white/5">
                            <Image
                                src={mainImage}
                                alt={product.name}
                                fill
                                className="object-contain p-6"
                                sizes="100vw"
                            />
                            {images.length > 1 && (
                                <>
                                    <button
                                        type="button"
                                        onClick={prevImage}
                                        className="absolute left-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                                        aria-label="Previous zoomed product image"
                                    >
                                        <ChevronLeft className="h-5 w-5" strokeWidth={1.7} />
                                    </button>
                                    <button
                                        type="button"
                                        onClick={nextImage}
                                        className="absolute right-4 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-full bg-white/15 text-white backdrop-blur transition-colors hover:bg-white/25"
                                        aria-label="Next zoomed product image"
                                    >
                                        <ChevronRight className="h-5 w-5" strokeWidth={1.7} />
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </>
    )
}
