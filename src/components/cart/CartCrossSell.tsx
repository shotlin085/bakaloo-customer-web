'use client'

import { useRef } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { useInView } from 'react-intersection-observer'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { ProductCard } from '@/components/product/ProductCard'
import { SectionHeader } from '@/components/shared/SectionHeader'
import { productsService } from '@/services/products.service'
import type { Product } from '@/types/product.types'

interface CartCrossSellProps {
    productIds: string[]
    cartProductIds: string[]
}

export function CartCrossSell({ productIds, cartProductIds }: CartCrossSellProps) {
    const scrollRef = useRef<HTMLDivElement>(null)
    const { ref, inView } = useInView({
        rootMargin: '220px 0px',
        threshold: 0.15,
        triggerOnce: true,
    })

    const { data: products = [], isLoading } = useQuery({
        queryKey: ['cart-cross-sell', productIds],
        queryFn: async () => {
            const cartIds = new Set(cartProductIds)
            const results = await Promise.allSettled(
                productIds.map((productId) => productsService.getRelated(productId, 4)),
            )

            const unique = new Map<string, Product>()

            for (const result of results) {
                if (result.status !== 'fulfilled') continue

                for (const product of result.value) {
                    if (cartIds.has(product.id) || unique.has(product.id)) continue
                    unique.set(product.id, product)
                    if (unique.size === 8) {
                        return Array.from(unique.values())
                    }
                }
            }

            return Array.from(unique.values())
        },
        enabled: inView && productIds.length > 0,
        staleTime: 5 * 60 * 1000,
    })

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const offset = scrollRef.current.clientWidth * 0.72
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -offset : offset,
            behavior: 'smooth',
        })
    }

    if (!productIds.length) return null
    if (inView && !isLoading && products.length === 0) return null

    return (
        <section
            ref={ref}
            className="rounded-[28px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.94)_0%,rgba(248,245,239,0.92)_100%)] px-4 py-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] sm:px-5"
        >
            <SectionHeader
                title="Frequently Bought Together"
                subtitle="Complete your basket with staples people usually add next."
                action={
                    <div className="hidden items-center gap-2 sm:flex">
                        <button
                            type="button"
                            onClick={() => scroll('left')}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-[#68737E] transition-colors hover:border-[rgba(104,72,198,0.16)] hover:text-[color:var(--shop-primary)]"
                            aria-label="Scroll cross-sell products left"
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={() => scroll('right')}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white text-[#68737E] transition-colors hover:border-[rgba(104,72,198,0.16)] hover:text-[color:var(--shop-primary)]"
                            aria-label="Scroll cross-sell products right"
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                }
            />

            <div ref={scrollRef} className="mt-5 flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:gap-4">
                {isLoading &&
                    Array.from({ length: 4 }).map((_, index) => (
                        <div
                            key={index}
                            className="h-[334px] w-[206px] min-w-[206px] rounded-[26px] border border-white/70 bg-white/80 skeleton-shimmer"
                        />
                    ))}

                {!isLoading && (
                    <motion.div
                        initial="hidden"
                        animate="show"
                        variants={{
                            hidden: {},
                            show: {
                                transition: {
                                    staggerChildren: 0.05,
                                },
                            },
                        }}
                        className="flex gap-3 sm:gap-4"
                    >
                        {products.map((product, index) => (
                            <motion.div
                                key={product.id}
                                variants={{
                                    hidden: { opacity: 0, y: 20 },
                                    show: { opacity: 1, y: 0 },
                                }}
                                className="w-[206px] min-w-[206px] flex-shrink-0 sm:w-[222px] sm:min-w-[222px] lg:w-[238px] lg:min-w-[238px]"
                            >
                                <ProductCard
                                    product={product}
                                    priority={index < 4}
                                    variant="section"
                                />
                            </motion.div>
                        ))}
                    </motion.div>
                )}
            </div>
        </section>
    )
}
