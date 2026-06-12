import type { LucideIcon } from 'lucide-react'
import { CheckCircle2, ShieldCheck, Truck } from 'lucide-react'
import { cn } from '@/lib/utils'

interface TrustItem {
  icon: LucideIcon
  label: string
}

interface TrustRowProps {
  items?: TrustItem[]
  className?: string
}

const DEFAULT_ITEMS: TrustItem[] = [
  { icon: ShieldCheck, label: 'Secure checkout' },
  { icon: CheckCircle2, label: 'No hidden charges' },
  { icon: Truck, label: 'Reliable delivery updates' },
]

export function TrustRow({ items = DEFAULT_ITEMS, className }: TrustRowProps) {
  return (
    <div className={cn('flex flex-wrap gap-2.5', className)}>
      {items.map(({ icon: Icon, label }) => (
        <span
          key={label}
          className="inline-flex items-center gap-2 rounded-full border border-[color:var(--shop-border)] bg-white/85 px-3 py-2 text-xs font-semibold text-[color:var(--shop-ink-muted)] shadow-[0_8px_20px_rgba(15,23,42,0.05)]"
        >
          <Icon className="h-3.5 w-3.5 text-[color:var(--shop-trust)]" strokeWidth={1.7} />
          {label}
        </span>
      ))}
    </div>
  )
}
