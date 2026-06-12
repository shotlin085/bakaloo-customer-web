import { Skeleton } from '@/components/ui/skeleton'

export default function ReviewsLoading() {
    return (
        <div className="space-y-4 px-6 py-8">
            <Skeleton className="h-7 w-32" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 rounded-2xl border border-gray-100 p-4">
                    <div className="flex items-center gap-3">
                        <Skeleton className="h-10 w-10 rounded-lg" />
                        <div className="flex-1 space-y-1">
                            <Skeleton className="h-4 w-2/3" />
                            <Skeleton className="h-3 w-20" />
                        </div>
                    </div>
                    <Skeleton className="h-3 w-full" />
                    <Skeleton className="h-3 w-4/5" />
                </div>
            ))}
        </div>
    )
}
