import { useMemo } from 'react'
import { useInfiniteQuery } from '@tanstack/react-query'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { productsService } from '@/services/products.service'

interface UseInfiniteProductsParams {
    categoryId?: string
    search?: string
    sort?: string
    inStock?: boolean
}

export function useInfiniteProducts(params: UseInfiniteProductsParams = {}) {
    const normalizedParams = useMemo(
        () => ({
            categoryId: params.categoryId || undefined,
            search: params.search?.trim() || undefined,
            sort: params.sort && params.sort !== 'relevance' ? params.sort : undefined,
            inStock: params.inStock ? true : undefined,
        }),
        [params.categoryId, params.inStock, params.search, params.sort],
    )

    return useInfiniteQuery({
        queryKey: QUERY_KEYS.products({ ...normalizedParams, type: 'infinite' }),
        queryFn: ({ pageParam = 1 }) =>
            productsService.getAll({
                page: pageParam,
                limit: 20,
                categoryId: normalizedParams.categoryId,
                search: normalizedParams.search,
                sort: normalizedParams.sort,
                inStock: normalizedParams.inStock,
            }),
        getNextPageParam: (lastPage) => {
            if (!lastPage.pagination) return undefined
            const { page, totalPages } = lastPage.pagination
            return page < totalPages ? page + 1 : undefined
        },
        initialPageParam: 1,
        staleTime: 5 * 60 * 1000,
    })
}
