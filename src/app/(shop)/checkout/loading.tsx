export default function CheckoutLoading() {
    return (
        <div className="page-enter px-6 py-6 lg:flex lg:gap-8">
            <div className="flex-1 space-y-4">
                <div className="mb-6 flex gap-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="skeleton-shimmer h-10 w-24 rounded-full" />
                    ))}
                </div>
                <div className="skeleton-shimmer h-48 w-full rounded-2xl" />
                <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
            </div>
            <div className="hidden w-[340px] lg:block">
                <div className="skeleton-shimmer h-64 rounded-2xl" />
            </div>
        </div>
    )
}
