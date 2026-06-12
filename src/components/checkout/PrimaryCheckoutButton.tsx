import { Loader2 } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PrimaryCheckoutButtonProps {
    label: string
    loading?: boolean
    disabled?: boolean
    onClick: () => void
    className?: string
}

export function PrimaryCheckoutButton({
    label,
    loading = false,
    disabled = false,
    onClick,
    className,
}: PrimaryCheckoutButtonProps) {
    return (
        <button
            type="button"
            onClick={onClick}
            disabled={disabled || loading}
            className={cn(
                'inline-flex h-14 w-full items-center justify-center rounded-xl bg-green-600 px-5 text-sm font-semibold text-white shadow-[0_16px_32px_rgba(22,163,74,0.24)] transition-all duration-200 hover:bg-green-700 active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-slate-200 disabled:text-slate-400 disabled:shadow-none',
                className,
            )}
        >
            {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : label}
        </button>
    )
}
