'use client'

import { useQuery } from '@tanstack/react-query'
import { ProductSectionRow } from '@/components/home/ProductSectionRow'
import { productsService } from '@/services/products.service'
import { QUERY_KEYS } from '@/lib/queryKeys'

interface RelatedProductsProps {
    productId: string
}

export function RelatedProducts({ productId }: RelatedProductsProps) {
    const { data: related = [] } = useQuery({
        queryKey: QUERY_KEYS.productRelated(productId),
        queryFn: () => productsService.getRelated(productId, 8),
        enabled: Boolean(productId),
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
