export default function WishlistLoading() {
    return (
        <div className="page-enter space-y-4 px-6 py-6">
            <div className="skeleton-shimmer h-8 w-40 rounded" />
            <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
                {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="skeleton-shimmer h-64 rounded-2xl" />
                ))}
            </div>
        </div>
    )
}
