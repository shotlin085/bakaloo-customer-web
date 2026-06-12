export function OrderCardSkeleton() {
    return (
        <div className="space-y-3 rounded-2xl border border-gray-100 p-4">
            <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-4 w-28" />
                <div className="skeleton-shimmer h-6 w-20 rounded-full" />
            </div>
            <div className="flex gap-2">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="skeleton-shimmer h-10 w-10 rounded-lg" />
                ))}
            </div>
            <div className="flex items-center justify-between">
                <div className="skeleton-shimmer h-4 w-24" />
                <div className="skeleton-shimmer h-9 w-28 rounded-xl" />
            </div>
        </div>
    )
}
