'use client'

import { Minus, Plus } from 'lucide-react'
import { cn } from '@/lib/utils'

interface QuantitySelectorProps {
    quantity: number
    min?: number
    max?: number
    onChange: (qty: number) => void
    size?: 'sm' | 'md'
}

export function QuantitySelector({
    quantity,
    min = 1,
    max = 99,
    onChange,
    size = 'md',
}: QuantitySelectorProps) {
    const btnSize = size === 'sm' ? 'h-7 w-7' : 'h-9 w-9'
    const iconSize = size === 'sm' ? 'h-3 w-3' : 'h-4 w-4'
    const textSize = size === 'sm' ? 'w-6 text-xs' : 'w-8 text-sm'

    return (
        <div className="inline-flex items-center gap-0.5 rounded-lg border border-gray-200 bg-gray-50">
            <button
                onClick={() => onChange(Math.max(min, quantity - 1))}
                disabled={quantity <= min}
                className={cn(
                    btnSize,
                    'flex items-center justify-center rounded-l-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40',
                )}
                type="button"
            >
                <Minus className={iconSize} />
            </button>

            <span className={cn(textSize, 'text-center font-semibold text-gray-900')}>{quantity}</span>

            <button
                onClick={() => onChange(Math.min(max, quantity + 1))}
                disabled={quantity >= max}
                className={cn(
                    btnSize,
                    'flex items-center justify-center rounded-r-lg text-gray-500 transition-colors hover:bg-gray-100 disabled:opacity-40',
                )}
                type="button"
            >
                <Plus className={iconSize} />
            </button>
        </div>
    )
}
