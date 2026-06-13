'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductSectionRow } from '@/components/home/ProductSectionRow'
import { productsService } from '@/services/products.service'
import { keys } from '@/lib/queryKeys'
import { useStoreContext } from '@/store/store.context'

interface RelatedProductsProps {
    productId: string
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
    const storeId = useStoreContext((s) => s.allocatedStoreId)

    const { data: related = [] } = useQuery({
        queryKey: keys.relatedProducts(storeId ?? '', productId),
        queryFn: () => productsService.getRelated(productId, 8),
        enabled: Boolean(productId) && Boolean(storeId),
        staleTime: 5 * 60 * 1000,
    })

    if (related.length === 0) return null

    return (
        <section className="mt-6 px-6 pb-12">
            <ProductSectionRow
                title="You Might Also Like"
                subtitle="Related products"
                products={related}
            />
        </section>
    )
}
