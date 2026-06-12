import Link from 'next/link'
import { ArrowRight, BadgeCheck, Leaf, ShieldCheck } from 'lucide-react'
import { SHOPFRONT_PROMISE_BANNER } from '@/lib/shopfront/shopfront-content'

const ICONS = [ShieldCheck, Leaf, BadgeCheck]

export function HomePromiseBanner() {
  return (
    <section className="px-3 pt-7 sm:px-4 lg:px-6 lg:pt-10">
      <div className="relative overflow-hidden rounded-[32px] border border-white/65 bg-[linear-gradient(135deg,rgba(242,228,255,0.92)_0%,rgba(234,240,255,0.92)_48%,rgba(234,247,240,0.90)_100%)] px-6 py-7 shadow-[0_20px_44px_rgba(76,29,149,0.10)] sm:px-8 sm:py-9 lg:px-10">
        <div className="absolute right-[-40px] top-[-40px] h-44 w-44 rounded-full bg-[rgba(255,255,255,0.32)] blur-2xl" />
        <div className="absolute bottom-[-60px] right-[15%] h-40 w-40 rounded-full bg-[rgba(104,72,198,0.12)] blur-3xl" />

        <div className="relative grid gap-8 lg:grid-cols-[minmax(0,1.2fr)_minmax(280px,0.8fr)] lg:items-center">
          <div>
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-[color:var(--shop-primary)]/80">
              {SHOPFRONT_PROMISE_BANNER.eyebrow}
            </p>
            <h3 className="mt-3 max-w-[620px] text-[32px] font-bold leading-[1.02] tracking-tight text-[color:var(--shop-ink)] sm:text-[38px]">
              {SHOPFRONT_PROMISE_BANNER.title}
            </h3>
            <p className="mt-4 max-w-[620px] text-sm leading-7 text-[color:var(--shop-ink-muted)] sm:text-[15px]">
              {SHOPFRONT_PROMISE_BANNER.subtitle}
            </p>

            <div className="mt-6 flex flex-wrap gap-3">
              {SHOPFRONT_PROMISE_BANNER.points.map((point, index) => {
                const Icon = ICONS[index % ICONS.length] ?? ShieldCheck
                return (
                  <span
                    key={point}
                    className="inline-flex items-center gap-2 rounded-full border border-white/80 bg-white/70 px-4 py-2 text-[13px] font-semibold text-[color:var(--shop-ink)] shadow-[0_10px_20px_rgba(15,23,42,0.06)]"
                  >
                    <Icon className="h-4 w-4 text-[color:var(--shop-primary)]" />
                    {point}
                  </span>
                )
              })}
            </div>

            <Link
              href={SHOPFRONT_PROMISE_BANNER.ctaHref}
              className="mt-7 inline-flex h-12 items-center justify-center gap-2 rounded-full bg-[color:var(--shop-primary)] px-5 text-sm font-semibold text-white shadow-[0_14px_28px_rgba(76,29,149,0.18)] transition-transform duration-200 hover:-translate-y-0.5"
            >
              {SHOPFRONT_PROMISE_BANNER.ctaLabel}
              <ArrowRight className="h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-3 sm:grid-cols-3 lg:grid-cols-1">
            <div className="rounded-[24px] border border-white/70 bg-white/72 p-4 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shop-primary)]/72">
                Organic Certification
              </p>
              <p className="mt-2 text-[18px] font-bold leading-tight text-[color:var(--shop-ink)]">
                Premium-grade groceries with cleaner sourcing signals.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-[linear-gradient(135deg,rgba(255,255,255,0.72)_0%,rgba(255,255,255,0.46)_100%)] p-4 shadow-[0_12px_24px_rgba(15,23,42,0.06)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shop-primary)]/72">
                Ethical Sourcing
              </p>
              <p className="mt-2 text-[18px] font-bold leading-tight text-[color:var(--shop-ink)]">
                Transparent handling from high-trust partners and regional suppliers.
              </p>
            </div>
            <div className="rounded-[24px] border border-white/70 bg-[rgba(104,72,198,0.10)] p-4 shadow-[0_12px_24px_rgba(76,29,149,0.08)]">
              <p className="text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shop-primary)]/72">
                Satisfaction First
              </p>
              <p className="mt-2 text-[18px] font-bold leading-tight text-[color:var(--shop-ink)]">
                If an item misses the standard, support resolves it fast and cleanly.
              </p>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
