import { Skeleton } from '@/components/ui/skeleton'


export default function HomeLoading() {
    return (
        <div className="space-y-8 pb-16">
            {/* Banner skeleton */}
            <div className="px-6 pt-4">
                <Skeleton className="h-[180px] sm:h-[220px] w-full rounded-2xl" />
            </div>

            {/* Categories skeleton */}
            <div className="px-6">
                <Skeleton className="h-6 w-32 mb-4 rounded" />
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 8 }).map((_, i) => (
                        <div key={i} className="flex flex-col items-center gap-2 flex-shrink-0">
                            <Skeleton className="w-[88px] h-[88px] rounded-2xl" />
                            <Skeleton className="h-3 w-12 rounded" />
                        </div>
                    ))}
                </div>
            </div>

            {/* Product sections skeleton */}
            <div className="px-6">
                <Skeleton className="h-6 w-40 mb-4 rounded" />
                <div className="flex gap-3 overflow-hidden">
                    {Array.from({ length: 5 }).map((_, i) => (
                        <div key={i} className="flex-shrink-0 w-[180px]">
                            <div className="bg-white rounded-2xl border border-gray-100 p-3 space-y-3">
                                <Skeleton className="h-[140px] w-full rounded-xl" />
                                <Skeleton className="h-4 w-4/5 rounded" />
                                <Skeleton className="h-3 w-1/3 rounded" />
                                <div className="flex items-center justify-between">
                                    <Skeleton className="h-5 w-16 rounded" />
                                    <Skeleton className="h-8 w-8 rounded-full" />
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    )
}
