import { cn } from '@/lib/utils'

interface PageHeaderProps {
  title: string
  subtitle?: string
  eyebrow?: string
  actions?: React.ReactNode
  className?: string
}

export function PageHeader({
  title,
  subtitle,
  eyebrow,
  actions,
  className,
}: PageHeaderProps) {
  return (
    <div className={cn('flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between', className)}>
      <div className="min-w-0">
        {eyebrow && (
          <p className="mb-2 text-[11px] font-semibold uppercase tracking-[0.18em] text-[color:var(--shop-ink-muted)]/80">
            {eyebrow}
          </p>
        )}
        <h1 className="text-[30px] font-bold leading-none tracking-tight text-[color:var(--shop-ink)] sm:text-[34px] lg:text-[38px]">
          {title}
        </h1>
        {subtitle && (
          <p className="mt-2 max-w-[720px] text-sm leading-6 text-[color:var(--shop-ink-muted)] sm:text-[15px]">
            {subtitle}
          </p>
        )}
      </div>
      {actions && <div className="flex shrink-0 flex-wrap items-center gap-3">{actions}</div>}
    </div>
  )
}
