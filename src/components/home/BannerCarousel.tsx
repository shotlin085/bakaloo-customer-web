'use client'

import useEmblaCarousel from 'embla-carousel-react'
import Autoplay from 'embla-carousel-autoplay'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { useRouter } from 'next/navigation'
import Image from 'next/image'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types/banner.types'

const FALLBACK_GRADIENTS = [
    'linear-gradient(135deg, #285F4A 0%, #16372B 100%)',
    'linear-gradient(135deg, #6B1F35 0%, #982A46 100%)',
    'linear-gradient(135deg, #244C7A 0%, #172C4A 100%)',
    'linear-gradient(135deg, #7C571C 0%, #A16E1B 100%)',
]

const EYEBROWS = ['Curated Fresh', 'Limited Run', 'Daily Highlight', 'Editor Pick']

function getEyebrow(banner: Banner, index: number) {
    return banner.subtitle?.trim() || EYEBROWS[index % EYEBROWS.length]
}

export function BannerCarousel({ banners }: { banners: Banner[] }) {
    const router = useRouter()
    const [selectedIndex, setSelectedIndex] = useState(0)

    const autoplay = useMemo(
        () =>
            Autoplay({
                delay: 4500,
                stopOnInteraction: true,
                stopOnMouseEnter: true,
            }),
        [],
    )

    const [emblaRef, emblaApi] = useEmblaCarousel(
        {
            loop: banners.length > 1,
            align: 'start',
            slidesToScroll: 1,
            dragFree: false,
            containScroll: 'trimSnaps',
        },
        [autoplay],
    )

    const onSelect = useCallback(() => {
        if (!emblaApi) return
        setSelectedIndex(emblaApi.selectedScrollSnap())
    }, [emblaApi])

    useEffect(() => {
        if (!emblaApi) return
        onSelect()
        emblaApi.on('select', onSelect)
        return () => {
            emblaApi.off('select', onSelect)
        }
    }, [emblaApi, onSelect])

    const openBanner = (banner: Banner) => {
        if (!banner.link_type || banner.link_type === 'none') return

        if (banner.link_type === 'category' && banner.link_value) {
            router.push(`/categories/${banner.link_value}`)
            return
        }

        if (banner.link_type === 'product' && banner.link_value) {
            router.push(`/products/${banner.link_value}`)
            return
        }

        if (banner.link_type === 'url' && banner.link_value) {
            window.open(banner.link_value, '_blank')
        }
    }

    if (banners.length === 0) return null

    return (
        <section className="px-3 pt-4 sm:px-4 lg:px-6">
            <div className="overflow-hidden" ref={emblaRef}>
                <div className="flex gap-3 sm:gap-4">
                    {banners.map((banner, index) => {
                        const eyebrow = getEyebrow(banner, index)
                        const hasImage = Boolean(banner.image_url)

                        return (
                            <article
                                key={banner.id}
                                className="min-w-0 flex-[0_0_100%] sm:flex-[0_0_88%] lg:flex-[0_0_calc(50%-8px)]"
                            >
                                <button
                                    type="button"
                                    onClick={() => openBanner(banner)}
                                    className="group block w-full text-left"
                                >
                                    <div
                                        className={cn(
                                            'relative h-[212px] overflow-hidden rounded-[30px] border border-white/60 shadow-[0_16px_40px_rgba(15,23,42,0.14)] transition-all duration-500 sm:h-[236px] lg:h-[268px]',
                                            selectedIndex === index ? 'opacity-100' : 'opacity-90',
                                        )}
                                        style={{
                                            background: hasImage
                                                ? undefined
                                                : FALLBACK_GRADIENTS[index % FALLBACK_GRADIENTS.length],
                                        }}
                                    >
                                        {hasImage && (
                                            <Image
                                                src={banner.image_url}
                                                alt={banner.title ?? 'Promotional banner'}
                                                fill
                                                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                                                sizes="(max-width: 640px) 100vw, (max-width: 1024px) 88vw, 50vw"
                                                priority={index < 2}
                                            />
                                        )}

                                        <div className="absolute inset-0 bg-[linear-gradient(115deg,rgba(11,18,24,0.18)_0%,rgba(11,18,24,0.08)_42%,rgba(11,18,24,0.56)_100%)]" />
                                        <div className="absolute inset-0 bg-[radial-gradient(circle_at_top_left,rgba(255,255,255,0.20),transparent_34%)]" />

                                        <div className="absolute left-4 top-4">
                                            <span className="rounded-full border border-white/35 bg-black/18 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/92 backdrop-blur-sm">
                                                {eyebrow}
                                            </span>
                                        </div>

                                        <div className="absolute bottom-4 left-4 right-4">
                                            {hasImage ? (
                                                <div className="flex items-end justify-between gap-3">
                                                    <div className="max-w-[68%] rounded-[18px] border border-white/18 bg-black/24 px-4 py-3 text-white backdrop-blur-sm">
                                                        <p className="line-clamp-1 text-[18px] font-bold tracking-tight sm:text-[22px]">
                                                            {banner.title || 'Fresh arrivals for your next basket'}
                                                        </p>
                                                        {banner.subtitle && (
                                                            <p className="mt-1 line-clamp-1 text-xs text-white/74 sm:text-sm">
                                                                {banner.subtitle}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <span className="inline-flex h-11 items-center justify-center rounded-full bg-white px-4 text-sm font-semibold text-[#111827] shadow-[0_12px_20px_rgba(0,0,0,0.18)]">
                                                        Explore
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="max-w-[72%] text-white">
                                                    <p className="text-[13px] font-semibold uppercase tracking-[0.22em] text-white/72">
                                                        Seasonal spotlight
                                                    </p>
                                                    <h3 className="mt-3 text-[30px] font-extrabold leading-[0.95] tracking-tight sm:text-[36px] lg:text-[44px]">
                                                        {banner.title || 'Fresh essentials delivered beautifully'}
                                                    </h3>
                                                    {banner.subtitle && (
                                                        <p className="mt-3 max-w-[420px] text-sm leading-6 text-white/84 sm:text-base">
                                                            {banner.subtitle}
                                                        </p>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </button>
                            </article>
                        )
                    })}
                </div>
            </div>

            {banners.length > 1 && (
                <div className="mt-5 flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        {banners.map((_, index) => (
                            <button
                                key={index}
                                type="button"
                                onClick={() => emblaApi?.scrollTo(index)}
                                className={cn(
                                    'transition-all duration-300',
                                    selectedIndex === index
                                        ? 'h-2.5 w-8 rounded-full bg-[#22C55E]'
                                        : 'h-2.5 w-2.5 rounded-full bg-[#C7CDD4] hover:bg-[#A7AFB8]',
                                )}
                                aria-label={`Go to banner ${index + 1}`}
                            />
                        ))}
                    </div>

                    <div className="hidden items-center gap-3 sm:flex">
                        <button
                            type="button"
                            onClick={() => emblaApi?.scrollPrev()}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#616A74] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:-translate-x-0.5 hover:border-[#D5E9DB] hover:bg-[#F5FBF7] hover:text-[#16A34A]"
                            aria-label="Previous banner"
                        >
                            <ChevronLeft className="h-5 w-5" strokeWidth={1.8} />
                        </button>
                        <button
                            type="button"
                            onClick={() => emblaApi?.scrollNext()}
                            className="flex h-11 w-11 items-center justify-center rounded-full border border-white/80 bg-white/78 text-[#616A74] shadow-[0_8px_18px_rgba(15,23,42,0.06)] transition-all duration-200 hover:translate-x-0.5 hover:border-[#D5E9DB] hover:bg-[#F5FBF7] hover:text-[#16A34A]"
                            aria-label="Next banner"
                        >
                            <ChevronRight className="h-5 w-5" strokeWidth={1.8} />
                        </button>
                    </div>
                </div>
            )}
        </section>
    )
}
