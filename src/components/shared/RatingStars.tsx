'use client'

import { Star } from 'lucide-react'
import { cn } from '@/lib/utils'

interface RatingStarsProps {
    value: number
    onChange?: (v: number) => void
    size?: 'sm' | 'md' | 'lg'
    className?: string
}

const SIZE_CLASSES = {
    sm: 'h-3.5 w-3.5',
    md: 'h-5 w-5',
    lg: 'h-6 w-6',
} as const

export function RatingStars({ value, onChange, size = 'sm', className }: RatingStarsProps) {
    const iconSize = SIZE_CLASSES[size]
    const safeValue = Number.isFinite(value) ? Math.max(0, Math.min(5, value)) : 0

    return (
        <div className={cn('flex items-center gap-0.5', className)} aria-label={`Rating ${safeValue} out of 5`}>
            {Array.from({ length: 5 }).map((_, index) => {
                const starNumber = index + 1
                const fillPercent = Math.max(0, Math.min(100, (safeValue - index) * 100))

                return (
                    <button
                        key={starNumber}
                        type="button"
                        onClick={onChange ? () => onChange(starNumber) : undefined}
                        className={cn('relative', onChange && 'cursor-pointer')}
                        disabled={!onChange}
                        aria-label={onChange ? `Set rating to ${starNumber}` : undefined}
                    >
                        <Star className={cn(iconSize, 'text-gray-200')} strokeWidth={1.5} />
                        {fillPercent > 0 && (
                            <span
                                className="pointer-events-none absolute inset-0 overflow-hidden"
                                style={{ width: `${fillPercent}%` }}
                            >
                                <Star
                                    className={cn(iconSize, 'text-amber-400')}
                                    fill="currentColor"
                                    strokeWidth={1.5}
                                />
                            </span>
                        )}
                    </button>
                )
            })}
        </div>
    )
}
