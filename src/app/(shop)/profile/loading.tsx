export default function ProfileLoading() {
    return (
        <div className="page-enter space-y-5 px-6 py-6">
            <div className="flex items-center gap-4">
                <div className="skeleton-shimmer h-16 w-16 rounded-full" />
                <div className="space-y-2">
                    <div className="skeleton-shimmer h-5 w-32 rounded" />
                    <div className="skeleton-shimmer h-4 w-24 rounded" />
                </div>
            </div>
            <div className="flex gap-4">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-shimmer h-16 flex-1 rounded-xl" />
                ))}
            </div>
            {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-14 rounded-xl" />
            ))}
        </div>
    )
}
