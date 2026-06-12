'use client'

import { useMemo, useState } from 'react'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { ordersService } from '@/services/orders.service'
import { QUERY_KEYS } from '@/lib/constants'

interface CancelOrderDialogProps {
    isOpen: boolean
    onClose: () => void
    orderId: string
    onCancelled: () => void
}

const REASONS = [
    'Changed my mind',
    'Found better price',
    'Ordered by mistake',
    'Taking too long',
    'Other',
] as const

export function CancelOrderDialog({ isOpen, onClose, orderId, onCancelled }: CancelOrderDialogProps) {
    const queryClient = useQueryClient()
    const [selectedReason, setSelectedReason] = useState<(typeof REASONS)[number]>('Changed my mind')
    const [otherReason, setOtherReason] = useState('')

    const finalReason = useMemo(() => {
        if (selectedReason === 'Other') return otherReason.trim()
        return selectedReason
    }, [otherReason, selectedReason])

    const cancelMutation = useMutation({
        mutationFn: async () => {
            await ordersService.cancel(orderId, finalReason || 'Order cancelled by user')
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: QUERY_KEYS.order(orderId) }),
                queryClient.invalidateQueries({ queryKey: ['orders'] }),
            ])
            toast.success('Order cancelled successfully')
            onCancelled()
        },
        onError: () => toast.error('Could not cancel order'),
    })

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[300] bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Cancel Order</h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                aria-label="Close cancel dialog"
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="space-y-2">
                            {REASONS.map((reason) => (
                                <label
                                    key={reason}
                                    className="flex cursor-pointer items-center gap-3 rounded-xl border border-gray-100 px-3 py-2.5"
                                >
                                    <input
                                        type="radio"
                                        name="cancel-reason"
                                        value={reason}
                                        checked={selectedReason === reason}
                                        onChange={() => setSelectedReason(reason)}
                                        className="h-4 w-4 border-gray-300 text-red-500 focus:ring-red-400"
                                    />
                                    <span className="text-sm text-gray-700">{reason}</span>
                                </label>
                            ))}
                        </div>

                        {selectedReason === 'Other' && (
                            <textarea
                                value={otherReason}
                                onChange={(event) => setOtherReason(event.target.value)}
                                placeholder="Tell us your reason..."
                                className="mt-3 h-24 w-full rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                maxLength={250}
                            />
                        )}

                        <p className="mt-3 text-xs text-gray-500">
                            Refund will be processed within 3-5 business days.
                        </p>

                        <div className="mt-5 grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-12 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                            >
                                Keep Order
                            </button>
                            <button
                                type="button"
                                onClick={() => cancelMutation.mutate()}
                                disabled={cancelMutation.isPending || !finalReason}
                                className="inline-flex h-12 items-center justify-center rounded-xl bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {cancelMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                ) : (
                                    'Cancel Order'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
