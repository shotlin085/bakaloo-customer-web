import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface PaymentMethodCardProps {
    icon: LucideIcon
    label: string
    subtext?: string
    badge?: string
    selected: boolean
    onSelect: () => void
    disabled?: boolean
}

export function PaymentMethodCard({
    icon: Icon,
    label,
    subtext,
    badge,
    selected,
    onSelect,
    disabled,
}: PaymentMethodCardProps) {
    return (
        <button
            onClick={onSelect}
            disabled={disabled}
            aria-pressed={selected}
            className={cn(
                'group flex w-full items-center gap-4 rounded-[24px] border-2 p-5 text-left transition-all duration-200',
                disabled && 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-75',
                selected &&
                    'border-green-600 bg-green-50/70 shadow-[0_14px_28px_rgba(22,163,74,0.12)]',
                !selected &&
                    !disabled &&
                    'border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.05)] hover:-translate-y-0.5 hover:border-slate-300 hover:shadow-[0_16px_32px_rgba(15,23,42,0.08)]',
            )}
            type="button"
        >
            <div
                className={cn(
                    'flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl transition-colors',
                    selected
                        ? 'bg-green-100 text-green-700'
                        : 'bg-slate-100 text-slate-500 group-hover:bg-slate-200',
                )}
            >
                <Icon className="h-5 w-5" strokeWidth={1.8} />
            </div>

            <div className="min-w-0 flex-1">
                <div className="flex flex-wrap items-center gap-2">
                    <span className="text-sm font-semibold text-slate-950">{label}</span>
                    {badge && (
                        <span className="rounded-full bg-slate-100 px-2.5 py-1 text-[10px] font-semibold uppercase tracking-[0.12em] text-slate-600">
                            {badge}
                        </span>
                    )}
                </div>
                {subtext && <p className="mt-1 text-sm text-slate-500">{subtext}</p>}
            </div>

            <div
                className={cn(
                    'flex h-6 w-6 shrink-0 items-center justify-center rounded-full border transition-all duration-200',
                    selected
                        ? 'border-green-600 bg-green-600 shadow-[0_8px_16px_rgba(22,163,74,0.22)]'
                        : 'border-slate-300 bg-white',
                )}
            >
                <Check
                    className={cn(
                        'h-3.5 w-3.5 transition-all duration-200',
                        selected ? 'scale-100 text-white opacity-100' : 'scale-75 text-transparent opacity-0',
                    )}
                    strokeWidth={3}
                />
            </div>
        </button>
    )
}
