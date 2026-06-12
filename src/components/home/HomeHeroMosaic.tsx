'use client'

import Autoplay from 'embla-carousel-autoplay'
import useEmblaCarousel from 'embla-carousel-react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { useCallback, useEffect, useMemo, useState } from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { cn } from '@/lib/utils'
import type { Banner } from '@/types/banner.types'

const FALLBACK_BACKGROUNDS = [
  'linear-gradient(135deg, #53208E 0%, #A84CC4 54%, #E8B84F 100%)',
  'linear-gradient(135deg, #224D48 0%, #3F8D68 56%, #D8EBC5 100%)',
  'linear-gradient(135deg, #4D233B 0%, #A2417A 58%, #F0C4D8 100%)',
]

function openBanner(router: ReturnType<typeof useRouter>, banner: Banner) {
  if (!banner.link_type || banner.link_type === 'none' || !banner.link_value) return

  if (banner.link_type === 'category') {
    router.push(`/categories/${banner.link_value}`)
    return
  }

  if (banner.link_type === 'product') {
    router.push(`/products/${banner.link_value}`)
    return
  }

  if (banner.link_type === 'url') {
    window.open(banner.link_value, '_blank', 'noopener,noreferrer')
  }
}

function getSlideCopy(banner: Banner, index: number) {
  const eyebrow = ['Premium selection', 'Editor pick', 'Daily highlight'][index % 3]

  return {
    eyebrow,
    title: banner.title || 'Fresh groceries, delivered with better taste and better timing.',
    subtitle:
      banner.subtitle || 'Build your basket from cleaner deals, top pantry staples, and same-day essentials.',
  }
}

export function HomeHeroMosaic({ banners }: { banners: Banner[] }) {
  const router = useRouter()
  const [selectedIndex, setSelectedIndex] = useState(0)
  const slides = useMemo(() => [...banners].sort((a, b) => a.sort_order - b.sort_order), [banners])

  const autoplay = useMemo(
    () =>
      Autoplay({
        delay: 5000,
        stopOnInteraction: false,
        stopOnMouseEnter: true,
        playOnInit: slides.length > 2,
      }),
    [slides.length],
  )

  const [emblaRef, emblaApi] = useEmblaCarousel(
    {
      loop: slides.length > 2,
      align: 'start',
      slidesToScroll: 1,
      containScroll: 'trimSnaps',
      dragFree: false,
      duration: 24,
    },
    slides.length > 2 ? [autoplay] : [],
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

  if (slides.length === 0) return null

  return (
    <section className="px-3 pt-5 sm:px-4 lg:px-6 lg:pt-6">
      <div className="relative rounded-[34px] border border-[rgba(108,84,196,0.10)] bg-[rgba(255,255,255,0.74)] p-1 shadow-[0_20px_48px_rgba(34,22,84,0.08)]">
        <div className="overflow-hidden" ref={emblaRef}>
          <div className="flex touch-pan-y gap-3 sm:gap-4">
            {slides.map((banner, index) => {
              const copy = getSlideCopy(banner, index)
              const hasImage = Boolean(banner.image_url)

              return (
                <article
                  key={banner.id}
                  className="relative min-w-0 flex-[0_0_100%] sm:flex-[0_0_84%] lg:flex-[0_0_calc(50%-8px)]"
                >
                  <button
                    type="button"
                    onClick={() => openBanner(router, banner)}
                    className="group relative block h-[310px] w-full overflow-hidden rounded-[30px] border border-[rgba(108,84,196,0.10)] bg-[linear-gradient(135deg,#FAF7FF_0%,#F7F5EF_100%)] text-left shadow-[0_16px_34px_rgba(34,22,84,0.07)] sm:h-[360px] lg:h-[410px]"
                    aria-label={`Open banner ${copy.title}`}
                  >
                    <div
                      className="absolute inset-0"
                      style={{
                        background: hasImage
                          ? undefined
                          : FALLBACK_BACKGROUNDS[index % FALLBACK_BACKGROUNDS.length],
                      }}
                    >
                      {hasImage && (
                        <Image
                          src={banner.image_url}
                          alt={banner.title || 'Promotional banner'}
                          fill
                          className="object-cover object-center transition-transform duration-700 group-hover:scale-[1.01]"
                          sizes="(max-width: 640px) 100vw, (max-width: 1024px) 84vw, 50vw"
                          priority={index < 2}
                        />
                      )}
                    </div>

                    {!hasImage && (
                      <>
                        <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(18,15,33,0.70)_0%,rgba(18,15,33,0.28)_46%,rgba(18,15,33,0.10)_100%)]" />
                        <div className="relative flex h-full items-end px-5 pb-5 pt-6 sm:px-6 sm:pb-6 lg:px-8 lg:pb-8">
                          <div className="max-w-[360px] text-white">
                            <span className="inline-flex rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.22em] text-white/84">
                              {copy.eyebrow}
                            </span>
                            <h1 className="mt-4 max-w-[11ch] text-[30px] font-bold leading-[0.95] tracking-[-0.04em] text-white sm:text-[38px] lg:text-[46px]">
                              {copy.title}
                            </h1>
                            <p className="mt-3 max-w-[34ch] text-sm leading-6 text-white/76 sm:text-[15px]">
                              {copy.subtitle}
                            </p>
                          </div>
                        </div>
                      </>
                    )}
                  </button>
                </article>
              )
            })}
          </div>
        </div>

        {slides.length > 1 && (
          <>
            <div className="mt-3 flex items-center justify-between px-1 pb-1 sm:mt-4">
              <div className="flex items-center gap-2">
              {slides.map((_, index) => (
                <button
                  key={index}
                  type="button"
                  onClick={() => emblaApi?.scrollTo(index)}
                  className={cn(
                    'transition-all duration-300',
                    selectedIndex === index
                      ? 'h-2.5 w-8 rounded-full bg-[color:var(--shop-primary)]'
                      : 'h-2.5 w-2.5 rounded-full bg-[rgba(75,0,130,0.18)] hover:bg-[rgba(75,0,130,0.34)]',
                  )}
                  aria-label={`Go to slide ${index + 1}`}
                />
              ))}
              </div>

              <div className="hidden items-center gap-3 sm:flex">
              <button
                type="button"
                onClick={() => emblaApi?.scrollPrev()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(108,84,196,0.14)] bg-white/96 text-[color:var(--shop-ink)] shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-200 hover:-translate-x-0.5"
                aria-label="Previous slide"
              >
                <ChevronLeft className="h-5 w-5" />
              </button>
              <button
                type="button"
                onClick={() => emblaApi?.scrollNext()}
                className="flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(108,84,196,0.2)] bg-white text-[color:var(--shop-primary)] shadow-[0_12px_24px_rgba(0,0,0,0.08)] transition-all duration-200 hover:translate-x-0.5"
                aria-label="Next slide"
              >
                <ChevronRight className="h-5 w-5" />
              </button>
              </div>
            </div>
          </>
        )}
      </div>
    </section>
  )
}

export function HomeHeroMosaicSkeleton() {
  return (
    <section className="px-3 pt-5 sm:px-4 lg:px-6 lg:pt-6">
      <div className="rounded-[34px] border border-[rgba(108,84,196,0.10)] bg-[rgba(255,255,255,0.74)] p-1 shadow-[0_20px_48px_rgba(34,22,84,0.08)]">
        <div className="grid gap-3 sm:gap-4 lg:grid-cols-2">
          <Skeleton className="h-[310px] w-full rounded-[30px] sm:h-[360px] lg:h-[410px]" />
          <Skeleton className="hidden h-[310px] w-full rounded-[30px] sm:block sm:h-[360px] lg:h-[410px]" />
        </div>
      </div>
    </section>
  )
}
