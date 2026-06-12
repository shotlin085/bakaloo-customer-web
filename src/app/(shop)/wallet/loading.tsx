export default function WalletLoading() {
    return (
        <div className="page-enter space-y-5 px-6 py-6">
            <div className="skeleton-shimmer h-44 rounded-2xl" />
            <div className="mb-3 flex gap-2">
                {['All', 'Credit', 'Debit'].map((tab) => (
                    <div key={tab} className="skeleton-shimmer h-9 w-16 rounded-full" />
                ))}
            </div>
            {Array.from({ length: 4 }).map((_, i) => (
                <div key={i} className="skeleton-shimmer h-16 rounded-xl" />
            ))}
        </div>
    )
}
