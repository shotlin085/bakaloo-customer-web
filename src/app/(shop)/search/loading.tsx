import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function SearchLoading() {
    return (
        <div className="space-y-6 px-6 py-6">
            <Skeleton className="h-8 w-64" />
            <ProductGridSkeleton count={8} />
        </div>
    )
}
