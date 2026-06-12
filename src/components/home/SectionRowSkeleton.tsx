import { ProductCardSkeleton } from '@/components/product/ProductCardSkeleton'

export function SectionRowSkeleton() {
    return (
        <div className="space-y-3">
            <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-5 w-36" />
                <div className="skeleton-shimmer h-4 w-16" />
            </div>
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 5 }).map((_, i) => (
                    <div key={i} className="w-40 shrink-0">
                        <ProductCardSkeleton />
                    </div>
                ))}
            </div>
        </div>
    )
}
