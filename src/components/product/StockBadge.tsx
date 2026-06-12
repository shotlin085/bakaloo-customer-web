import { cn } from '@/lib/utils'

interface StockBadgeProps {
    stock: number
    className?: string
}

export function StockBadge({ stock, className }: StockBadgeProps) {
    if (stock <= 0) {
        return <span className={cn('text-xs font-semibold text-red-500', className)}>Out of Stock</span>
    }
    if (stock <= 5) {
        return <span className={cn('text-xs font-semibold text-amber-500', className)}>Only {stock} left</span>
    }
    return <span className={cn('text-xs font-semibold text-green-500', className)}>In Stock</span>
}
