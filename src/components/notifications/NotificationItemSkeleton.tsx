export function NotificationItemSkeleton() {
    return (
        <div className="flex items-start gap-3 rounded-xl p-4">
            <div className="skeleton-shimmer h-10 w-10 shrink-0 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-4 w-3/4" />
                <div className="skeleton-shimmer h-3 w-1/2" />
            </div>
            <div className="skeleton-shimmer h-3 w-12" />
        </div>
    )
}
