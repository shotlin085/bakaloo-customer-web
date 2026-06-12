'use client'

import { useState, type ReactNode } from 'react'
import { ChevronUp } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { formatINR } from '@/lib/utils'
import { PrimaryCheckoutButton } from './PrimaryCheckoutButton'

interface StickySummaryBarProps {
    total: number
    itemCount: number
    ctaLabel: string
    onCtaClick: () => void
    disabled?: boolean
    loading?: boolean
    children: ReactNode
}

export function StickySummaryBar({
    total,
    itemCount,
    ctaLabel,
    onCtaClick,
    disabled = false,
    loading = false,
    children,
}: StickySummaryBarProps) {
    const [open, setOpen] = useState(false)

    return (
        <>
            <div className="fixed inset-x-0 bottom-0 z-[220] border-t border-slate-200 bg-white/95 px-4 py-3 shadow-[0_-16px_32px_rgba(15,23,42,0.08)] backdrop-blur lg:hidden">
                <div className="mx-auto flex max-w-2xl items-center gap-3">
                    <button
                        type="button"
                        onClick={() => setOpen(true)}
                        className="flex flex-1 items-center justify-between rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-left"
                    >
                        <div>
                            <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-400">
                                Order total
                            </p>
                            <p className="mt-1 text-base font-semibold text-slate-950">
                                {formatINR(total)}
                            </p>
                            <p className="mt-1 text-xs text-slate-500">{itemCount} items · View breakdown</p>
                        </div>
                        <ChevronUp className="h-4 w-4 text-slate-400" />
                    </button>

                    <div className="w-[48%] min-w-[164px]">
                        <PrimaryCheckoutButton
                            label={ctaLabel}
                            loading={loading}
                            disabled={disabled}
                            onClick={onCtaClick}
                            className="h-12 text-xs sm:text-sm"
                        />
                    </div>
                </div>
            </div>

            <Sheet open={open} onOpenChange={setOpen}>
                <SheetContent
                    side="bottom"
                    className="rounded-t-[28px] border-slate-200 bg-slate-50 px-4 pb-6 pt-5"
                >
                    <SheetHeader className="mb-4">
                        <SheetTitle className="text-left text-slate-950">Order breakdown</SheetTitle>
                    </SheetHeader>
                    <div className="space-y-4">{children}</div>
                </SheetContent>
            </Sheet>
        </>
    )
}
