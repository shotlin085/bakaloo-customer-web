export function CategoryRowSkeleton() {
    return (
        <div className="space-y-3">
            <div className="skeleton-shimmer h-5 w-32" />
            <div className="flex gap-4 overflow-hidden">
                {Array.from({ length: 8 }).map((_, i) => (
                    <div key={i} className="flex shrink-0 flex-col items-center gap-2">
                        <div className="skeleton-shimmer h-14 w-14 rounded-full" />
                        <div className="skeleton-shimmer h-3 w-12" />
                    </div>
                ))}
            </div>
        </div>
    )
}
