import { QueryClient, MutationCache, QueryCache } from '@tanstack/react-query'
import { AxiosError } from 'axios'
import { toast } from 'sonner'

function getMsg(err: unknown): string {
    if (err instanceof AxiosError) {
        return (err.response?.data as { message?: string })?.message ?? 'Something went wrong'
    }
    if (err instanceof Error) return err.message
    return 'An unexpected error occurred'
}

export function createQueryClient() {
    return new QueryClient({
        queryCache: new QueryCache({
            onError: (error, query) => {
                // Only toast if this was a background refetch (user already has data)
                if (query.state.data !== undefined) {
                    toast.error(getMsg(error))
                }
            },
        }),
        mutationCache: new MutationCache({
            onError: (error) => toast.error(getMsg(error)),
        }),
        defaultOptions: {
            queries: {
                staleTime: 5 * 60 * 1000,
                gcTime: 10 * 60 * 1000,
                retry: (count, err) => {
                    if (err instanceof AxiosError) {
                        const s = err.response?.status ?? 0
                        if (s >= 400 && s < 500) return false // Never retry client errors
                    }
                    return count < 2
                },
                refetchOnWindowFocus: false,
                refetchOnReconnect: true,
            },
            mutations: { retry: false },
        },
    })
}

// Per-resource stale times (used in individual hooks)
export const STALE_TIMES = {
    banners: 30 * 60 * 1000,     // 30 min
    categories: 30 * 60 * 1000,  // 30 min
    products: 5 * 60 * 1000,     // 5 min
    cart: 0,                      // Always fresh
    orders: 30 * 1000,            // 30 sec
    wallet: 0,                    // Always fresh (financial)
    notifications: 0,             // Real-time
    user: 15 * 60 * 1000,         // 15 min
    addresses: 10 * 60 * 1000,    // 10 min
} as const
