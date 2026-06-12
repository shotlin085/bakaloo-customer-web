import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface TrustBadgeProps {
    icon: LucideIcon
    label: string
    subtext?: string
    className?: string
}

export function TrustBadge({
    icon: Icon,
    label,
    subtext,
    className,
}: TrustBadgeProps) {
    return (
        <div
            className={cn(
                'flex items-start gap-3 rounded-2xl border border-slate-200 bg-white px-4 py-3',
                className,
            )}
        >
            <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-2xl bg-slate-100 text-slate-600">
                <Icon className="h-4 w-4" strokeWidth={1.8} />
            </div>
            <div className="min-w-0">
                <p className="text-sm font-semibold text-slate-950">{label}</p>
                {subtext && <p className="mt-1 text-xs leading-5 text-slate-500">{subtext}</p>}
            </div>
        </div>
    )
}
