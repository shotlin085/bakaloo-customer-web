export function ProfileHeaderSkeleton() {
    return (
        <div className="flex items-center gap-4 py-4">
            <div className="skeleton-shimmer h-16 w-16 rounded-full" />
            <div className="flex-1 space-y-2">
                <div className="skeleton-shimmer h-5 w-40" />
                <div className="skeleton-shimmer h-4 w-28" />
            </div>
        </div>
    )
}
