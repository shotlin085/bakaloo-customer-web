import { Skeleton } from '@/components/ui/skeleton'

export default function EditProfileLoading() {
    return (
        <div className="mx-auto max-w-md space-y-6 px-6 py-8">
            <Skeleton className="h-7 w-32" />
            <div className="space-y-4">
                <div>
                    <Skeleton className="mb-1.5 h-4 w-16" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div>
                    <Skeleton className="mb-1.5 h-4 w-16" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
                <div>
                    <Skeleton className="mb-1.5 h-4 w-16" />
                    <Skeleton className="h-12 w-full rounded-xl" />
                </div>
            </div>
            <Skeleton className="h-12 w-full rounded-xl" />
        </div>
    )
}
