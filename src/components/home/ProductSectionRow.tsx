'use client'

import { useRef } from 'react'
import { ProductCard } from '@/components/product/ProductCard'
import { HomeSectionHeader } from './HomeSectionHeader'
import type { Product } from '@/types/product.types'

interface Props {
    title: string
    subtitle?: string
    products: Product[]
    viewAllHref?: string
    showNewBadge?: boolean
    containerClassName?: string
}

export function ProductSectionRow({
    title,
    subtitle,
    products,
    viewAllHref,
    showNewBadge,
    containerClassName,
}: Props) {
    const scrollRef = useRef<HTMLDivElement>(null)

    const scroll = (direction: 'left' | 'right') => {
        if (!scrollRef.current) return
        const offset = scrollRef.current.clientWidth * 0.72
        scrollRef.current.scrollBy({
            left: direction === 'left' ? -offset : offset,
            behavior: 'smooth',
        })
    }

    if (products.length === 0) return null

    return (
        <section className={containerClassName}>
            <HomeSectionHeader
                title={title}
                subtitle={subtitle}
                viewAllHref={viewAllHref}
                onPrev={() => scroll('left')}
                onNext={() => scroll('right')}
            />

            <div ref={scrollRef} className="flex gap-3 overflow-x-auto pb-2 scrollbar-hide sm:gap-4">
                {products.map((product, index) => (
                    <div
                        key={product.id}
                        className="w-[206px] min-w-[206px] flex-shrink-0 sm:w-[222px] sm:min-w-[222px] lg:w-[238px] lg:min-w-[238px]"
                    >
                        <ProductCard
                            product={product}
                            showNewBadge={showNewBadge}
                            priority={index < 4}
                            variant="section"
                        />
                    </div>
                ))}
            </div>
        </section>
    )
}
