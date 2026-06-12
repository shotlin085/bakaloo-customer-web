'use client'

import { useQuery } from '@tanstack/react-query'
import { productsService } from '@/services/products.service'
import { ProductSectionRow } from '@/components/home/ProductSectionRow'
import { useRecentlyViewed } from '@/hooks/useRecentlyViewed'

interface RecentlyViewedSectionProps {
    /** The current product ID to exclude from the list */
    currentProductId: string
}

export function RecentlyViewedSection({ currentProductId }: RecentlyViewedSectionProps) {
    const { recentlyViewedIds } = useRecentlyViewed()

    // Exclude the current product and take up to 8
    const idsToFetch = recentlyViewedIds
        .filter((id) => id !== currentProductId)
        .slice(0, 8)

    const { data: products = [] } = useQuery({
        queryKey: ['recently-viewed', idsToFetch.join(',')],
        queryFn: async () => {
            if (idsToFetch.length === 0) return []
            // Fetch each product individually (they're likely cached)
            const results = await Promise.allSettled(
                idsToFetch.map((id) => productsService.getById(id))
            )
            return results
                .filter((r): r is PromiseFulfilledResult<Awaited<ReturnType<typeof productsService.getById>>> => r.status === 'fulfilled')
                .map((r) => r.value)
                .filter(Boolean)
        },
        enabled: idsToFetch.length >= 2,
        staleTime: 5 * 60 * 1000,
    })

    if (products.length < 2) return null

    return (
        <section>
            <ProductSectionRow
                title="Recently Viewed"
                subtitle="Products you've looked at recently"
                products={products}
            />
        </section>
    )
}
