import { cn } from '@/lib/utils'

interface SectionHeaderProps {
  title: string
  subtitle?: string
  action?: React.ReactNode
  className?: string
}

export function SectionHeader({ title, subtitle, action, className }: SectionHeaderProps) {
  return (
    <div className={cn('flex items-end justify-between gap-4', className)}>
      <div>
        <h2 className="text-[22px] font-bold tracking-tight text-[color:var(--shop-ink)] sm:text-[26px]">
          {title}
        </h2>
        {subtitle && (
          <p className="mt-1 text-sm text-[color:var(--shop-ink-muted)]">{subtitle}</p>
        )}
      </div>
      {action && <div className="shrink-0">{action}</div>}
    </div>
  )
}
