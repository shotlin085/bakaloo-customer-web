import { ProductGridSkeleton } from '@/components/product/ProductGridSkeleton'
import { Skeleton } from '@/components/ui/skeleton'

export default function CategoryLoading() {
    return (
        <div className="space-y-6 px-6 py-6">
            <Skeleton className="h-8 w-40" />
            <ProductGridSkeleton count={8} />
        </div>
    )
}
