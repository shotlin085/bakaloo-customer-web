import { Skeleton } from '@/components/ui/skeleton'

export default function AddressesLoading() {
    return (
        <div className="space-y-4 px-6 py-8">
            <Skeleton className="h-7 w-40" />
            {[1, 2, 3].map((i) => (
                <div key={i} className="space-y-2 rounded-2xl border border-gray-100 p-4">
                    <Skeleton className="h-5 w-16 rounded-md" />
                    <Skeleton className="h-4 w-3/4" />
                    <Skeleton className="h-3 w-1/2" />
                </div>
            ))}
        </div>
    )
}
