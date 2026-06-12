'use client'

import { useCallback, useEffect, useState } from 'react'
import { useQueryClient } from '@tanstack/react-query'
import { socketManager } from '@/lib/socket'
import { QUERY_KEYS } from '@/lib/constants'

interface RiderLocation {
    lat: number
    lng: number
    heading?: number
    updatedAt: string
}

interface OrderTrackingState {
    riderLocation: RiderLocation | null
    liveStatus: string | null
    isConnected: boolean
}

export function useOrderTracking(orderId: string, enabled = true) {
    const queryClient = useQueryClient()
    const [state, setState] = useState<OrderTrackingState>({
        riderLocation: null,
        liveStatus: null,
        isConnected: false,
    })

    const handleStatusUpdate = useCallback(
        (payload: unknown) => {
            const data = payload as { status?: string } | null
            if (!data?.status) return
            const status = String(data.status)
            setState((prev) => ({ ...prev, liveStatus: status }))
            queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(orderId) })
        },
        [orderId, queryClient],
    )

    const handleRiderLocation = useCallback((payload: unknown) => {
        const data = payload as RiderLocation | null
        if (!data || typeof data.lat !== 'number' || typeof data.lng !== 'number') return
        setState((prev) => ({ ...prev, riderLocation: data }))
    }, [])

    const handleDelivered = useCallback(() => {
        setState((prev) => ({ ...prev, liveStatus: 'DELIVERED' }))
        queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(orderId) })
        queryClient.invalidateQueries({ queryKey: ['orders'] })
    }, [orderId, queryClient])

    useEffect(() => {
        if (!enabled || !orderId) return

        socketManager.emit('order:track', { orderId })
        setState((prev) => ({ ...prev, isConnected: socketManager.isConnected() }))

        socketManager.on('order:status', handleStatusUpdate)
        socketManager.on('rider:location:update', handleRiderLocation)
        socketManager.on('order:delivered', handleDelivered)

        return () => {
            socketManager.emit('order:untrack', { orderId })
            socketManager.off('order:status', handleStatusUpdate)
            socketManager.off('rider:location:update', handleRiderLocation)
            socketManager.off('order:delivered', handleDelivered)
        }
    }, [enabled, handleDelivered, handleRiderLocation, handleStatusUpdate, orderId])

    return state
}
