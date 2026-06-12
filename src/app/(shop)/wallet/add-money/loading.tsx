import { Skeleton } from '@/components/ui/skeleton'

export default function AddMoneyLoading() {
    return (
        <div className="mx-auto max-w-md space-y-6 px-6 py-8">
            <Skeleton className="h-7 w-40" />
            <div className="flex justify-center gap-3">
                {[1, 2, 3, 4].map((i) => (
                    <Skeleton key={i} className="h-10 w-16 rounded-lg" />
                ))}
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    )
}
