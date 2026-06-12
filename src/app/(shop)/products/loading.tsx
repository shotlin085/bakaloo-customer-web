import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function ProductsLoading() {
    return (
        <div className="space-y-6 px-6 py-6">
            <Skeleton className="h-8 w-48" />
            <Skeleton className="h-12 w-full rounded-xl" />
            <ProductGridSkeleton count={12} />
        </div>
    )
}
