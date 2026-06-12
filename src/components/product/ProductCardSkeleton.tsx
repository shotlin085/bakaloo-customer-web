import { Skeleton } from '@/components/ui/skeleton'

interface ProductCardSkeletonProps {
    variant?: 'default' | 'section'
}

export function ProductCardSkeleton({ variant = 'default' }: ProductCardSkeletonProps) {
    if (variant === 'section') {
        return (
            <div className="space-y-3 rounded-[12px] border border-[#D1D5DB] bg-white p-4">
                <div className="flex items-center justify-between">
                    <Skeleton className="h-5 w-24 rounded" />
                    <Skeleton className="h-6 w-6 rounded-full" />
                </div>
                <Skeleton className="h-[108px] w-full rounded-xl sm:h-[116px] lg:h-[124px]" />
                <Skeleton className="h-5 w-16 rounded-full" />
                <div className="flex items-center gap-2">
                    <Skeleton className="h-7 w-16 rounded" />
                    <Skeleton className="h-5 w-12 rounded" />
                    <Skeleton className="h-6 w-12 rounded" />
                </div>
                <Skeleton className="h-4 w-5/6 rounded" />
                <Skeleton className="h-4 w-4/6 rounded" />
                <div className="flex items-center gap-1">
                    {Array.from({ length: 5 }).map((_, idx) => (
                        <Skeleton key={idx} className="h-3 w-3 rounded-full" />
                    ))}
                    <Skeleton className="ml-2 h-3.5 w-12 rounded" />
                </div>
                <Skeleton className="h-11 w-full rounded-full" />
            </div>
        )
    }

    return (
        <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
            <Skeleton className="h-[140px] w-full rounded-xl" />
            <Skeleton className="h-4 w-4/5 rounded" />
            <Skeleton className="h-3 w-1/3 rounded" />
            <div className="flex items-center justify-between">
                <Skeleton className="h-5 w-16 rounded" />
                <Skeleton className="h-8 w-8 rounded-full" />
            </div>
        </div>
    )
}

export function ProductGridSkeleton({ count = 8 }: { count?: number }) {
    return (
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {Array.from({ length: count }).map((_, i) => (
                <ProductCardSkeleton key={i} />
            ))}
        </div>
    )
}
