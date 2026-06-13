'use client'

import { useQuery } from '@tanstack/react-query'
import { keys, STALE } from '@/lib/queryKeys'
import { productsService } from '@/services/products.service'
import { useStoreContext } from '@/store/store.context'
import type { ShopProduct } from '@/types/product.types'
import { cn } from '@/lib/utils'

interface ProductFamilyOptionsProps {
    /** The family_id of the current product — component only mounts when this is present */
    familyId: string
    /** The ID of the currently selected variant (shopProductId) */
    selectedShopProductId: string
    /** Called when a variant chip is selected */
    onSelect: (variant: ShopProduct) => void
}

/**
 * Horizontally scrollable chip row showing all variants in a product family.
 * Chips for inactive variants are muted and non-interactive.
 *
 * Only mount this component when `product.family_id` is present (lazy / conditional).
 *
 * Requirements: REQ-6.2, REQ-6.3, REQ-6.4, REQ-13.3, NFR-3
 */
export function ProductFamilyOptions({
    familyId,
    selectedShopProductId,
    onSelect,
}: ProductFamilyOptionsProps) {
    const storeId = useStoreContext((s) => s.allocatedStoreId)

    const { data: variants = [], isLoading } = useQuery({
        queryKey: keys.productOptions(storeId ?? '', familyId),
        queryFn: () => productsService.getProductFamily(familyId),
        staleTime: STALE.products,
        enabled: Boolean(storeId) && Boolean(familyId),
    })

    if (isLoading) {
        return (
            <div className="flex gap-2 overflow-x-auto pb-1">
                {Array.from({ length: 4 }).map((_, i) => (
                    <div
                        key={i}
                        className="h-9 w-16 shrink-0 animate-pulse rounded-full bg-gray-100"
                    />
                ))}
            </div>
        )
    }

    if (variants.length === 0) return null

    return (
        <div
            className="flex gap-2 overflow-x-auto pb-1 scrollbar-none"
            role="group"
            aria-label="Product size options"
        >
            {variants.map((variant) => {
                const isSelected = variant.shop_product_id === selectedShopProductId
                const isActive = variant.shop_is_active !== false

                return (
                    <button
                        key={variant.shop_product_id ?? variant.id}
                        type="button"
                        disabled={!isActive}
                        onClick={() => isActive && onSelect(variant)}
                        aria-pressed={isSelected}
                        aria-disabled={!isActive}
                        className={cn(
                            'shrink-0 rounded-full border px-4 py-1.5 text-sm font-medium transition-all min-h-[36px]',
                            isSelected
                                ? 'border-purple-600 bg-purple-600 text-white shadow-sm'
                                : isActive
                                    ? 'border-gray-200 bg-white text-gray-800 hover:border-purple-400 hover:bg-purple-50'
                                    : 'cursor-not-allowed border-gray-100 bg-gray-50 text-gray-300 line-through',
                        )}
                    >
                        {variant.option_label ?? variant.net_quantity ?? variant.name}
                    </button>
                )
            })}
        </div>
    )
}
