export default function CartLoading() {
    return (
        <div className="page-enter space-y-4 px-6 py-6">
            <div className="skeleton-shimmer h-8 w-32 rounded" />
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="flex gap-4 rounded-xl border border-gray-100 p-4">
                    <div className="skeleton-shimmer h-20 w-20 flex-shrink-0 rounded-xl" />
                    <div className="flex-1 space-y-2">
                        <div className="skeleton-shimmer h-4 w-3/4 rounded" />
                        <div className="skeleton-shimmer h-4 w-1/3 rounded" />
                        <div className="skeleton-shimmer h-8 w-28 rounded-lg" />
                    </div>
                </div>
            ))}
            <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
        </div>
    )
}
