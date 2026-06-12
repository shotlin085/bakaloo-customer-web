import Link from 'next/link'
import type { LucideIcon } from 'lucide-react'

interface EmptyStateCardProps {
  icon: LucideIcon
  title: string
  subtitle: string
  ctaLabel?: string
  ctaHref?: string
}

export function EmptyStateCard({
  icon: Icon,
  title,
  subtitle,
  ctaLabel,
  ctaHref,
}: EmptyStateCardProps) {
  return (
    <div className="rounded-[28px] border border-[color:var(--shop-border)] bg-[linear-gradient(180deg,rgba(255,255,255,0.96)_0%,rgba(248,245,239,0.98)_100%)] px-6 py-12 text-center shadow-[var(--shop-shadow-soft)]">
      <div className="mx-auto mb-5 flex h-20 w-20 items-center justify-center rounded-[24px] bg-[var(--shop-seasonal-accent-wash)]">
        <Icon className="h-10 w-10 text-[color:var(--shop-primary)]" strokeWidth={1.5} />
      </div>
      <h3 className="text-xl font-bold tracking-tight text-[color:var(--shop-ink)]">{title}</h3>
      <p className="mx-auto mt-2 max-w-[320px] text-sm leading-6 text-[color:var(--shop-ink-muted)]">
        {subtitle}
      </p>
      {ctaLabel && ctaHref && (
        <Link
          href={ctaHref}
          className="mt-6 inline-flex h-11 items-center justify-center rounded-full bg-[color:var(--shop-primary)] px-6 text-sm font-semibold text-white transition-colors hover:bg-[color:var(--shop-primary-hover)]"
        >
          {ctaLabel}
        </Link>
      )}
    </div>
  )
}
