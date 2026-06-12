'use client'

import { useState } from 'react'
import { Loader2 } from 'lucide-react'
import { Sheet, SheetContent, SheetHeader, SheetTitle } from '@/components/ui/sheet'
import { cn, formatINR } from '@/lib/utils'

const QUICK = [100, 200, 500, 1000]

interface AddMoneySheetProps {
    open: boolean
    onOpenChange: (value: boolean) => void
    onSubmit: (amount: number) => Promise<void>
}

export function AddMoneySheet({ open, onOpenChange, onSubmit }: AddMoneySheetProps) {
    const [amount, setAmount] = useState<number | ''>('')
    const [loading, setLoading] = useState(false)
    const value = typeof amount === 'number' ? amount : 0

    const handleSubmit = async () => {
        if (value < 100) return
        setLoading(true)
        try {
            await onSubmit(value)
            onOpenChange(false)
        } finally {
            setLoading(false)
        }
    }

    return (
        <Sheet open={open} onOpenChange={onOpenChange}>
            <SheetContent side="bottom" className="rounded-t-2xl">
                <SheetHeader>
                    <SheetTitle>Add Money to Wallet</SheetTitle>
                </SheetHeader>

                <div className="space-y-4 py-4">
                    <div className="flex items-center justify-center gap-1">
                        <span className="text-2xl font-bold">₹</span>
                        <input
                            type="number"
                            value={amount}
                            onChange={(event) => setAmount(event.target.value ? Number(event.target.value) : '')}
                            placeholder="0"
                            className="w-28 bg-transparent text-center text-2xl font-bold outline-none placeholder:text-gray-300"
                            min={100}
                            max={10000}
                        />
                    </div>

                    <div className="flex justify-center gap-2">
                        {QUICK.map((quickAmount) => (
                            <button
                                key={quickAmount}
                                onClick={() => setAmount(quickAmount)}
                                className={cn(
                                    'rounded-lg border px-3 py-1.5 text-sm font-semibold',
                                    amount === quickAmount
                                        ? 'border-green-500 bg-green-50 text-green-700'
                                        : 'border-gray-200 text-gray-600',
                                )}
                                type="button"
                            >
                                ₹{quickAmount}
                            </button>
                        ))}
                    </div>

                    <button
                        onClick={handleSubmit}
                        disabled={value < 100 || loading}
                        className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white disabled:opacity-50"
                        type="button"
                    >
                        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : `Pay ${value >= 100 ? formatINR(value) : '₹0'}`}
                    </button>
                </div>
            </SheetContent>
        </Sheet>
    )
}
