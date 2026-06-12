'use client'

import { useMemo } from 'react'
import Image from 'next/image'
import { useRouter } from 'next/navigation'
import { ArrowRight } from 'lucide-react'
import { Skeleton } from '@/components/ui/skeleton'
import { SHOPFRONT_CAMPAIGN_COPY } from '@/lib/shopfront/shopfront-content'
import type { Banner } from '@/types/banner.types'

const CARD_FALLBACKS = [
  'linear-gradient(135deg, #7251D8 0%, #8C6BE7 62%, #3B936A 100%)',
  'linear-gradient(135deg, #8E60D9 0%, #D387C8 100%)',
]

const STRIP_FALLBACK =
  'linear-gradient(135deg, rgba(245,237,255,0.96) 0%, rgba(237,245,239,0.94) 100%)'

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

type PromoOffersSectionProps = {
  banners: Banner[]
}

export function PromoOffersSection({ banners }: PromoOffersSectionProps) {
  const router = useRouter()
  const cardBanners = useMemo(() => banners.slice(0, 2), [banners])
  const stripBanner = banners[2] ?? null

  if (cardBanners.length === 0) return null

  return (
    <section className="space-y-4 px-3 pt-5 sm:px-4 lg:px-6 lg:pt-6">
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        {cardBanners.map((banner, index) => (
          <button
            key={banner.id}
            type="button"
            onClick={() => openBanner(router, banner)}
            className="group relative h-[212px] w-full overflow-hidden rounded-[28px] border border-white/70 text-left shadow-[0_16px_34px_rgba(42,28,92,0.10)] transition-all duration-300 hover:-translate-y-1 hover:shadow-[0_20px_42px_rgba(42,28,92,0.14)] sm:h-[228px]"
            style={{
              background: banner.image_url ? undefined : CARD_FALLBACKS[index % CARD_FALLBACKS.length],
            }}
            aria-label={`Open promotional banner ${banner.title || index + 1}`}
          >
            {banner.image_url && (
              <Image
                src={banner.image_url}
                alt={banner.title || 'Promotional banner'}
                fill
                className="object-cover transition-transform duration-500 group-hover:scale-[1.03]"
                sizes="(max-width: 1024px) 100vw, 50vw"
                priority={index < 2}
              />
            )}
            <div className="absolute inset-0 bg-[linear-gradient(180deg,rgba(16,14,28,0.12)_0%,rgba(16,14,28,0.48)_100%)]" />

            <div className="absolute inset-x-5 bottom-5">
              <div className="inline-flex rounded-full border border-white/18 bg-black/22 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-white/78 backdrop-blur-sm">
                {index === 0 ? 'Curated value' : 'Seasonal campaign'}
              </div>
              <div className="mt-3 flex items-end justify-between gap-3">
                <div className="min-w-0 rounded-[18px] border border-white/16 bg-black/18 px-4 py-3 text-white backdrop-blur-sm">
                  <p className="line-clamp-2 text-[22px] font-bold leading-[1.05] tracking-tight">
                    {banner.title || 'Premium grocery collection'}
                  </p>
                  {banner.subtitle && (
                    <p className="mt-1 line-clamp-2 text-sm text-white/76">{banner.subtitle}</p>
                  )}
                </div>
                <span className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full bg-white text-[color:var(--shop-primary)] shadow-[0_8px_18px_rgba(0,0,0,0.18)]">
                  <ArrowRight className="h-4 w-4" />
                </span>
              </div>
            </div>
          </button>
        ))}
      </div>

      {stripBanner && (
        <button
          type="button"
          onClick={() => openBanner(router, stripBanner)}
          className="group relative flex h-[130px] w-full items-center overflow-hidden rounded-[26px] border border-white/70 text-left shadow-[0_12px_26px_rgba(42,28,92,0.08)] sm:h-[142px]"
          style={{
            background: stripBanner.image_url ? undefined : STRIP_FALLBACK,
          }}
          aria-label="Open special campaign strip"
        >
          {stripBanner.image_url && (
            <Image
              src={stripBanner.image_url}
              alt={stripBanner.title ?? 'Campaign strip'}
              fill
              className="object-cover transition-transform duration-500 group-hover:scale-[1.02]"
              sizes="100vw"
            />
          )}

          <div className="absolute inset-0 bg-[linear-gradient(90deg,rgba(34,20,65,0.32)_0%,rgba(34,20,65,0.14)_38%,rgba(34,20,65,0.16)_100%)]" />

          <div className="relative flex w-full items-center justify-between gap-4 px-5 sm:px-6">
            <div className="max-w-[68%] text-white">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-white/72">
                Value spotlight
              </p>
              <h4 className="mt-2 line-clamp-1 text-[24px] font-bold leading-none tracking-tight sm:text-[30px]">
                {stripBanner.title || 'Daily fresh produce. Quality guaranteed.'}
              </h4>
              <p className="mt-2 line-clamp-1 text-sm text-white/78">
                {stripBanner.subtitle || 'Browse cleaner deals with better merchandising and sharper value signals.'}
              </p>
            </div>
            <span className="inline-flex h-11 items-center rounded-full bg-white px-4 text-sm font-semibold text-[color:var(--shop-primary)] shadow-[0_8px_18px_rgba(0,0,0,0.16)]">
              {SHOPFRONT_CAMPAIGN_COPY.stripLabel}
            </span>
          </div>
        </button>
      )}
    </section>
  )
}

export function PromoOffersSectionSkeleton() {
  return (
    <section className="space-y-4 px-3 pt-5 sm:px-4 lg:px-6 lg:pt-6">
      <div className="grid gap-3 lg:grid-cols-2 lg:gap-4">
        {Array.from({ length: 2 }).map((_, index) => (
          <Skeleton key={index} className="h-[212px] w-full rounded-[28px] sm:h-[228px]" />
        ))}
      </div>
      <Skeleton className="h-[130px] w-full rounded-[26px] sm:h-[142px]" />
    </section>
  )
}
