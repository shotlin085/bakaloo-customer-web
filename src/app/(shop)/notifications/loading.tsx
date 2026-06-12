export default function NotificationsLoading() {
    return (
        <div className="page-enter space-y-3 px-6 py-6">
            <div className="skeleton-shimmer h-8 w-36 rounded" />
            {Array.from({ length: 5 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-20 rounded-xl" />
            ))}
        </div>
    )
}
