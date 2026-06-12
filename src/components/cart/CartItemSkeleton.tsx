export function CartItemSkeleton() {
    return (
        <div className="flex items-center gap-4 rounded-2xl border border-gray-100 p-4">
            <div className="skeleton-shimmer h-16 w-16 shrink-0 rounded-xl" />
            <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-3/4" />
                <div className="skeleton-shimmer h-3 w-1/4" />
            </div>
            <div className="flex flex-col items-end gap-2">
                <div className="skeleton-shimmer h-4 w-16" />
                <div className="skeleton-shimmer h-8 w-24 rounded-lg" />
            </div>
        </div>
    )
}
