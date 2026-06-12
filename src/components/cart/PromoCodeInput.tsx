'use client'

import { useState } from 'react'
import { ChevronRight, Loader2, Tag, X } from 'lucide-react'
import { cn } from '@/lib/utils'

interface PromoCodeInputProps {
    appliedCode: string | null
    discount: number
    isValidating: boolean
    onApply: (code: string) => void
    onRemove: () => void
    onViewCoupons: () => void
}

export function PromoCodeInput({
    appliedCode,
    isValidating,
    onApply,
    onRemove,
    onViewCoupons,
}: PromoCodeInputProps) {
    const [code, setCode] = useState('')

    if (appliedCode) {
        return (
            <div className="flex items-center justify-between rounded-[22px] border border-[#D6E7DA] bg-[linear-gradient(180deg,#F5FFF7_0%,#EEF8F1_100%)] px-4 py-4 shadow-[0_10px_20px_rgba(22,163,74,0.06)]">
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-green-600" strokeWidth={1.5} />
                    <span className="text-sm font-semibold text-green-700">{appliedCode}</span>
                    <span className="text-xs text-green-600">applied</span>
                </div>
                <button
                    onClick={onRemove}
                    className="flex h-7 w-7 items-center justify-center rounded-full hover:bg-green-100"
                >
                    <X className="h-3.5 w-3.5 text-green-600" />
                </button>
            </div>
        )
    }

    return (
        <div className="space-y-3">
            <div className="flex gap-2">
                <input
                    type="text"
                    placeholder="Promo code"
                    value={code}
                    onChange={(event) => setCode(event.target.value.toUpperCase())}
                    className="flex-1 rounded-[20px] border border-[#E4E7EA] bg-[#FCFBF8] px-4 py-3.5 text-sm font-medium text-gray-900 placeholder:text-gray-400 shadow-[inset_0_1px_0_rgba(255,255,255,0.9)] focus:border-[color:var(--shop-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--shop-primary)]"
                />
                <button
                    onClick={() => {
                        if (code.trim()) onApply(code.trim())
                    }}
                    disabled={!code.trim() || isValidating}
                    className={cn(
                        'rounded-[20px] px-5 py-3.5 text-sm font-semibold transition-colors',
                        code.trim()
                            ? 'bg-[color:var(--shop-primary)] text-white hover:bg-[color:var(--shop-primary-hover)]'
                            : 'bg-[#EFF1F3] text-[#9AA1A9]',
                    )}
                >
                    {isValidating ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Apply'}
                </button>
            </div>

            <button
                onClick={onViewCoupons}
                className="flex w-full items-center justify-between rounded-[20px] border border-dashed border-[#D7DDDE] bg-white/60 px-4 py-3.5 text-left transition-colors hover:border-[color:var(--shop-primary)]/50 hover:bg-[rgba(108,84,196,0.04)]"
            >
                <div className="flex items-center gap-2">
                    <Tag className="h-4 w-4 text-[color:var(--shop-primary)]/70" strokeWidth={1.5} />
                    <span className="text-sm font-medium text-[#5E6874]">Browse available coupons</span>
                </div>
                <ChevronRight className="h-4 w-4 text-[color:var(--shop-primary)]/70" />
            </button>
        </div>
    )
}
