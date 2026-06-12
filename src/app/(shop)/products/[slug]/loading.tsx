export default function ProductDetailLoading() {
    return (
        <div className="page-enter px-6 py-6 lg:flex lg:gap-10">
            <div className="mb-6 lg:mb-0 lg:w-[55%]">
                <div className="skeleton-shimmer h-[300px] w-full rounded-2xl sm:h-[400px]" />
                <div className="mt-3 flex gap-2">
                    {Array.from({ length: 4 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-16 w-16 flex-shrink-0 rounded-xl" />
                    ))}
                </div>
            </div>
            <div className="space-y-4 lg:w-[45%]">
                <div className="skeleton-shimmer h-4 w-20 rounded" />
                <div className="skeleton-shimmer h-8 w-3/4 rounded" />
                <div className="skeleton-shimmer h-10 w-40 rounded" />
                <div className="skeleton-shimmer h-4 w-24 rounded" />
                <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
                <div className="skeleton-shimmer h-14 w-full rounded-2xl" />
                <div className="skeleton-shimmer h-20 w-full rounded" />
            </div>
        </div>
    )
}
