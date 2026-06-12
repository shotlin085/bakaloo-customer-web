import Link from 'next/link'
import { ChevronLeft, ChevronRight } from 'lucide-react'

interface HomeSectionHeaderProps {
    title: string
    subtitle?: string
    viewAllHref?: string
    onPrev?: () => void
    onNext?: () => void
    eyebrow?: string
    controlsDisabled?: boolean
}

export function HomeSectionHeader({
    title,
    subtitle,
    viewAllHref,
    onPrev,
    onNext,
    eyebrow,
    controlsDisabled = false,
}: HomeSectionHeaderProps) {
    const showControls = Boolean(onPrev && onNext)

    return (
        <div className="mb-4 flex items-end justify-between gap-4 sm:mb-5">
            <div>
                {eyebrow && (
                    <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shop-primary)]/72">
                        {eyebrow}
                    </p>
                )}
                <h2 className="text-[28px] font-bold leading-none tracking-tight text-[color:var(--shop-ink)] sm:text-[32px] lg:text-[36px]">
                    {title}
                </h2>
                {subtitle && (
                    <p className="mt-2 max-w-[540px] text-[13px] leading-6 text-[color:var(--shop-ink-muted)] sm:text-[14px]">
                        {subtitle}
                    </p>
                )}
            </div>

            <div className="flex shrink-0 items-center gap-2.5">
                {viewAllHref && (
                    <Link
                        href={viewAllHref}
                        className="hidden rounded-full border border-white/80 bg-white/82 px-4 py-2 text-sm font-semibold text-[color:var(--shop-ink-muted)] shadow-[0_8px_18px_rgba(42,28,92,0.06)] transition-all duration-200 hover:border-[rgba(104,72,198,0.16)] hover:text-[color:var(--shop-primary)] sm:inline-flex"
                    >
                        View All
                    </Link>
                )}

                {showControls && (
                    <div className="flex items-center gap-2">
                        <button
                            type="button"
                            onClick={onPrev}
                            disabled={controlsDisabled}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/82 text-[color:var(--shop-ink-muted)] shadow-[0_8px_18px_rgba(42,28,92,0.06)] transition-all duration-200 hover:border-[rgba(104,72,198,0.16)] hover:bg-[rgba(104,72,198,0.06)] hover:text-[color:var(--shop-primary)] disabled:cursor-not-allowed disabled:opacity-45"
                            aria-label={`Previous ${title}`}
                        >
                            <ChevronLeft className="h-4 w-4" />
                        </button>
                        <button
                            type="button"
                            onClick={onNext}
                            disabled={controlsDisabled}
                            className="flex h-10 w-10 items-center justify-center rounded-full border border-white/80 bg-white/82 text-[color:var(--shop-ink-muted)] shadow-[0_8px_18px_rgba(42,28,92,0.06)] transition-all duration-200 hover:border-[rgba(104,72,198,0.16)] hover:bg-[rgba(104,72,198,0.06)] hover:text-[color:var(--shop-primary)] disabled:cursor-not-allowed disabled:opacity-45"
                            aria-label={`Next ${title}`}
                        >
                            <ChevronRight className="h-4 w-4" />
                        </button>
                    </div>
                )}
            </div>
        </div>
    )
}
