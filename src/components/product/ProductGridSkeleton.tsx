import { ProductCardSkeleton } from './ProductCardSkeleton'

interface ProductGridSkeletonProps {
    count?: number
}

export function ProductGridSkeleton({ count = 8 }: ProductGridSkeletonProps) {
    return (
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-5">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}
