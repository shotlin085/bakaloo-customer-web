'use client'

import { useQuery } from '@tanstack/react-query'
import { QUERY_KEYS, STALE_TIMES } from '@/lib/constants'
import { productsService } from '@/services/products.service'
import { ProductSectionRow } from './ProductSectionRow'

export function DealsSection() {
    const { data } = useQuery({
        queryKey: QUERY_KEYS.products({ section: 'deals' }),
        queryFn: () => productsService.getDeals(),
        staleTime: STALE_TIMES.products,
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
