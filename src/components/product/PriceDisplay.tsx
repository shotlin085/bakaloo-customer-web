import { cn, discountPercent, formatINR } from '@/lib/utils'

interface PriceDisplayProps {
    price: number
    salePrice?: number | null
    size?: 'sm' | 'md' | 'lg'
}

const sizes = {
    sm: { main: 'text-sm', strike: 'text-xs', badge: 'px-1.5 py-0.5 text-[10px]' },
    md: { main: 'text-base', strike: 'text-sm', badge: 'px-2 py-0.5 text-xs' },
    lg: { main: 'text-xl', strike: 'text-base', badge: 'px-2 py-1 text-xs' },
} as const

export function PriceDisplay({ price, salePrice, size = 'md' }: PriceDisplayProps) {
    const sizeClasses = sizes[size]
    const hasDiscount = salePrice != null && salePrice < price
    const displayPrice = hasDiscount ? salePrice : price

    return (
        <div className="flex items-center gap-2">
            <span className={cn(sizeClasses.main, 'font-bold text-gray-900')}>{formatINR(displayPrice)}</span>
            {hasDiscount && (
                <>
                    <span className={cn(sizeClasses.strike, 'font-medium text-gray-400 line-through')}>
                        {formatINR(price)}
                    </span>
                    <span className={cn(sizeClasses.badge, 'rounded-full bg-green-50 font-semibold text-green-600')}>
                        {discountPercent(price, salePrice)}% OFF
                    </span>
                </>
            )}
        </div>
    )
}
