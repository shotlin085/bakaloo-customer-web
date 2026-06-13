'use client'

import { useQuery } from '@tanstack/react-query'
import { keys, STALE } from '@/lib/queryKeys'
import { productsService } from '@/services/products.service'
import { useStoreContext } from '@/store/store.context'
import { ProductSectionRow } from './ProductSectionRow'

export function DealsSection() {
    const storeId = useStoreContext((s) => s.allocatedStoreId)

    const { data } = useQuery({
        queryKey: keys.dealsProducts(storeId ?? ''),
        queryFn: () => productsService.getDeals(),
        staleTime: STALE.products,
        enabled: Boolean(storeId),
    })

    const products = data ?? []
    if (!products.length) return null

    return (
        <ProductSectionRow
            title="Deals & Offers"
            products={products}
            viewAllHref="/products?sort=deals"
        />
    )
}
