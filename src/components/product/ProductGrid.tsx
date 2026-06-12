import type { ReactNode } from 'react'
import { ProductCardSkeleton } from './ProductCardSkeleton'

interface ProductGridProps {
    children: ReactNode
}

interface ProductGridSkeletonProps {
    count?: number
    variant?: 'default' | 'section'
}

export function ProductGrid({ children }: ProductGridProps) {
    return (
        <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {children}
        </div>
    )
}

export function ProductGridSkeleton({ count = 10, variant = 'default' }: ProductGridSkeletonProps) {
    return (
        <ProductGrid>
            {Array.from({ length: count }).map((_, index) => (
                <ProductCardSkeleton key={index} variant={variant} />
            ))}
        </ProductGrid>
    )
}
