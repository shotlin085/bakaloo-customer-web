export default function OrdersLoading() {
    return (
        <div className="page-enter space-y-4 px-6 py-6">
            <div className="skeleton-shimmer h-8 w-40 rounded" />
            <div className="mb-4 flex gap-2">
                {['Active', 'Past', 'Cancelled'].map((tab) => (
                    <div key={tab} className="skeleton-shimmer h-9 w-20 rounded-full" />
                ))}
            </div>
            {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-28 rounded-2xl" />
            ))}
        </div>
    )
}
