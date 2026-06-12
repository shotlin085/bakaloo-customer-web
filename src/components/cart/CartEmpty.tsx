'use client'

import Link from 'next/link'
import { useQuery } from '@tanstack/react-query'
import { motion, useReducedMotion } from 'framer-motion'
import { ArrowRight, ShoppingBag } from 'lucide-react'
import { ProductSectionRow } from '@/components/home/ProductSectionRow'
import { categoriesService } from '@/services/categories.service'
import { productsService } from '@/services/products.service'

export function CartEmpty() {
    const reduceMotion = useReducedMotion()
    const { data: featured = [] } = useQuery({
        queryKey: ['cart-empty-featured'],
        queryFn: () => productsService.getFeatured(6),
        staleTime: 5 * 60 * 1000,
    })
    const { data: categories = [] } = useQuery({
        queryKey: ['cart-empty-categories'],
        queryFn: categoriesService.getAll,
        staleTime: 30 * 60 * 1000,
    })

    return (
        <div className="space-y-8">
            <div className="overflow-hidden rounded-[36px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.98)_0%,rgba(247,243,255,0.94)_46%,rgba(236,248,240,0.95)_100%)] px-6 py-12 shadow-[0_24px_50px_rgba(15,23,42,0.08)] sm:px-10 sm:py-16">
                <div className="mx-auto max-w-[620px] text-center">
                    <motion.div
                        animate={
                            reduceMotion
                                ? undefined
                                : {
                                      y: [0, -8, 0],
                                      rotate: [0, -3, 3, 0],
                                  }
                        }
                        transition={
                            reduceMotion
                                ? undefined
                                : {
                                      duration: 4.6,
                                      repeat: Infinity,
                                      ease: 'easeInOut',
                                  }
                        }
                        className="mx-auto mb-6 flex h-28 w-28 items-center justify-center rounded-[32px] bg-[linear-gradient(180deg,#F6FAF7_0%,#EAF3ED_100%)] shadow-[0_14px_28px_rgba(15,23,42,0.05)]"
                    >
                        <ShoppingBag className="h-14 w-14 text-[color:var(--shop-primary)]/55" strokeWidth={1.5} />
                    </motion.div>

                    <p className="text-[11px] font-semibold uppercase tracking-[0.20em] text-[#98A0A8]">
                        Basket waiting
                    </p>
                    <h2 className="mt-3 text-[34px] font-bold tracking-[-0.04em] text-[#16202A]">
                        Your cart is empty
                    </h2>
                    <p className="mt-3 text-sm leading-7 text-[#68737E] sm:text-[15px]">
                        Build a better basket with fresh produce, pantry staples, premium grocery picks, and ready-to-cook essentials before checkout.
                    </p>

                    <div className="mt-8 flex flex-col items-center justify-center gap-3 sm:flex-row">
                        <Link
                            href="/products"
                            className="inline-flex h-12 items-center rounded-full bg-[color:var(--shop-primary)] px-8 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(104,72,198,0.18)] transition-colors hover:bg-[color:var(--shop-primary-hover)]"
                        >
                            Start Shopping
                        </Link>
                        <Link
                            href="/products?sort=popular"
                            className="inline-flex h-12 items-center gap-2 rounded-full border border-white/80 bg-white/86 px-6 text-sm font-semibold text-[#475569] transition-colors hover:text-[color:var(--shop-primary)]"
                        >
                            Explore popular picks
                            <ArrowRight className="h-4 w-4" />
                        </Link>
                    </div>

                    {categories.length > 0 && (
                        <div className="mt-8">
                            <p className="text-xs font-semibold uppercase tracking-[0.16em] text-[#98A0A8]">
                                Browse by category
                            </p>
                            <div className="mt-4 flex flex-wrap justify-center gap-2">
                                {categories.slice(0, 6).map((category) => (
                                    <Link
                                        key={category.id}
                                        href={`/products?categoryId=${category.id}`}
                                        className="rounded-full border border-white/80 bg-white/86 px-4 py-2 text-sm font-medium text-[#475569] transition-colors hover:text-[color:var(--shop-primary)]"
                                    >
                                        {category.name}
                                    </Link>
                                ))}
                            </div>
                        </div>
                    )}
                </div>
            </div>

            {featured.length > 0 && (
                <div className="rounded-[32px] border border-white/70 bg-[linear-gradient(180deg,rgba(255,255,255,0.95)_0%,rgba(248,245,239,0.92)_100%)] px-4 py-5 shadow-[0_14px_28px_rgba(15,23,42,0.05)] sm:px-5">
                    <ProductSectionRow
                        title="Popular Picks"
                        subtitle="Jump back in with featured products people reorder most."
                        products={featured}
                        viewAllHref="/products"
                        containerClassName="w-full"
                    />
                </div>
            )}
        </div>
    )
}
