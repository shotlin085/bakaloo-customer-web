export function TransactionRowSkeleton() {
    return (
        <div className="flex items-center gap-3 py-3">
            <div className="skeleton-shimmer h-10 w-10 rounded-full" />
            <div className="flex-1 space-y-1.5">
                <div className="skeleton-shimmer h-4 w-2/3" />
                <div className="skeleton-shimmer h-3 w-1/3" />
            </div>
            <div className="skeleton-shimmer h-4 w-16" />
        </div>
    )
}
