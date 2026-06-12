'use client'

import { cn } from '@/lib/utils'

interface LoyaltyPointsBadgeProps {
    points: number
    size?: 'sm' | 'md'
}

export function LoyaltyPointsBadge({ points, size = 'sm' }: LoyaltyPointsBadgeProps) {
    return (
        <span
            className={cn(
                'inline-flex items-center gap-1 rounded-full bg-amber-50 font-semibold text-amber-700',
                size === 'sm' ? 'px-2.5 py-0.5 text-xs' : 'px-3 py-1 text-sm',
            )}
        >
            <span>🪙</span>
            <span className="font-bold">{points}</span>
            <span>pts</span>
        </span>
    )
}
