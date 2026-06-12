export default function OrderDetailLoading() {
    return (
        <div className="page-enter space-y-5 px-6 py-6">
            <div className="flex items-center gap-2">
                <div className="skeleton-shimmer h-9 w-9 rounded-full" />
                <div className="skeleton-shimmer h-6 w-48 rounded" />
            </div>
            <div className="skeleton-shimmer h-20 rounded-2xl" />
            <div className="skeleton-shimmer h-40 rounded-2xl" />
            <div className="skeleton-shimmer h-32 rounded-2xl" />
        </div>
    )
}
