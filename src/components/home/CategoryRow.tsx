'use client'

import { forwardRef, useImperativeHandle } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import useEmblaCarousel from 'embla-carousel-react'
import type { Category } from '@/types/product.types'

export type CategoryRowHandle = {
    scrollPrev: () => void
    scrollNext: () => void
}

type CategoryRowProps = {
    categories: Category[]
}

type CategoryVisualStyle = {
    tint: string
    fallback: string
    emoji: string
}

const DEFAULT_STYLE: CategoryVisualStyle = {
    tint: '#EAE7E0',
    fallback: 'linear-gradient(145deg, #EFEAE2, #E5DED2)',
    emoji: '🛒',
}

const CATEGORY_STYLES: Record<string, CategoryVisualStyle> = {
    fruits: { tint: '#E4F1E5', fallback: 'linear-gradient(145deg, #EAF5E8, #DDEAD9)', emoji: '🍎' },
    vegetables: { tint: '#E3F0E6', fallback: 'linear-gradient(145deg, #E9F6EC, #DBE8DF)', emoji: '🥬' },
    dairy: { tint: '#E8EEF8', fallback: 'linear-gradient(145deg, #EEF2F8, #DCE5F4)', emoji: '🥛' },
    eggs: { tint: '#ECEEF5', fallback: 'linear-gradient(145deg, #F0F1F6, #E1E4EC)', emoji: '🥚' },
    bakery: { tint: '#EFE7D9', fallback: 'linear-gradient(145deg, #F3EBDD, #E7DCC7)', emoji: '🍞' },
    bread: { tint: '#EFE7D9', fallback: 'linear-gradient(145deg, #F3EBDD, #E7DCC7)', emoji: '🥖' },
    beverages: { tint: '#E8EDF0', fallback: 'linear-gradient(145deg, #EFF2F4, #E0E6EA)', emoji: '🥤' },
    drinks: { tint: '#E8EDF0', fallback: 'linear-gradient(145deg, #EFF2F4, #E0E6EA)', emoji: '🥤' },
    snacks: { tint: '#F2E8D9', fallback: 'linear-gradient(145deg, #F5ECDD, #EADCC5)', emoji: '🍪' },
    chips: { tint: '#F2E8D9', fallback: 'linear-gradient(145deg, #F5ECDD, #EADCC5)', emoji: '🍟' },
    meat: { tint: '#EEE3DE', fallback: 'linear-gradient(145deg, #F2E8E4, #E7D8D2)', emoji: '🥩' },
    fish: { tint: '#E6EDF1', fallback: 'linear-gradient(145deg, #EEF3F6, #DAE4EA)', emoji: '🐟' },
    grains: { tint: '#EFE8DE', fallback: 'linear-gradient(145deg, #F5EEE5, #E8DED0)', emoji: '🌾' },
}

const SLIDE_WIDTH_CLASS = 'w-[156px] sm:w-[174px] lg:w-[calc((100%-64px)/5)]'
const SLIDE_HEIGHT_CLASS = 'h-[188px] sm:h-[204px] lg:h-[214px]'

function getCategoryStyle(name: string): CategoryVisualStyle {
    const key = name.toLowerCase().split(/[\s,&-]+/).find(Boolean) ?? 'default'
    return CATEGORY_STYLES[key] ?? DEFAULT_STYLE
}

export const CategoryRow = forwardRef<CategoryRowHandle, CategoryRowProps>(function CategoryRow(
    { categories },
    ref,
) {
    const [emblaRef, emblaApi] = useEmblaCarousel({
        loop: false,
        align: 'start',
        slidesToScroll: 1,
        containScroll: 'trimSnaps',
        dragFree: false,
    })

    useImperativeHandle(ref, () => ({
        scrollPrev: () => emblaApi?.scrollPrev(),
        scrollNext: () => emblaApi?.scrollNext(),
    }))

    return (
        <div className="overflow-hidden" ref={emblaRef}>
            <div className="-ml-3 flex sm:-ml-4">
                {categories.map((category, index) => {
                    const style = getCategoryStyle(category.name)

                    return (
                        <div key={category.id} className={`shrink-0 pl-3 sm:pl-4 ${SLIDE_WIDTH_CLASS}`}>
                            <Link
                                href={`/categories/${category.id}`}
                                aria-label={`Browse ${category.name}`}
                                className={`group relative block overflow-hidden rounded-[24px] border border-white/70 shadow-[0_10px_26px_rgba(15,23,42,0.08)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_18px_30px_rgba(15,23,42,0.12)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#22C55E] focus-visible:ring-offset-2 focus-visible:ring-offset-[#ECE7DE] ${SLIDE_HEIGHT_CLASS}`}
                            >
                                <div
                                    className="absolute inset-0"
                                    style={{
                                        background: style.fallback,
                                    }}
                                />

                                {category.image_url ? (
                                    <Image
                                        src={category.image_url}
                                        alt={category.name}
                                        fill
                                        priority={index < 5}
                                        className="object-cover transition-transform duration-500 group-hover:scale-[1.04]"
                                        sizes="(max-width: 640px) 156px, (max-width: 1024px) 174px, 20vw"
                                    />
                                ) : (
                                    <div
                                        className="absolute inset-0 flex items-center justify-center"
                                        style={{ backgroundColor: style.tint }}
                                    >
                                        <span className="text-[48px] leading-none sm:text-[54px]">{style.emoji}</span>
                                    </div>
                                )}

                                <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(9,16,23,0.02)_0%,rgba(9,16,23,0.08)_55%,rgba(9,16,23,0.20)_100%)]" />

                                <div className="absolute inset-x-3 bottom-3 sm:inset-x-4">
                                    <span className="frosted-panel flex min-h-[42px] items-center justify-center rounded-full border border-white/70 bg-white/86 px-3.5 py-2 text-center shadow-[0_10px_20px_rgba(15,23,42,0.16)]">
                                        <span className="line-clamp-2 text-[12px] font-semibold leading-tight text-[#16202A] sm:text-[13px]">
                                            {category.name}
                                        </span>
                                    </span>
                                </div>
                            </Link>
                        </div>
                    )
                })}
            </div>
        </div>
    )
})
