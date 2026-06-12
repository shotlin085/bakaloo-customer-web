'use client'

import { useMemo, useState } from 'react'
import { AxiosError } from 'axios'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { reviewsService } from '@/services/reviews.service'
import { RatingStars } from '@/components/shared/RatingStars'

interface ReviewFormProps {
    isOpen: boolean
    onClose: () => void
    productId: string
    productName: string
    orderId?: string
}

const LABELS = ['Terrible', 'Poor', 'Average', 'Good', 'Excellent'] as const

export function ReviewForm({ isOpen, onClose, productId, productName, orderId }: ReviewFormProps) {
    const queryClient = useQueryClient()
    const [rating, setRating] = useState(0)
    const [comment, setComment] = useState('')

    const selectedLabel = useMemo(
        () => (rating > 0 ? LABELS[rating - 1] : 'Select a rating'),
        [rating],
    )

    const submitMutation = useMutation({
        mutationFn: async () => {
            if (!orderId) throw new Error('Missing order id')
            return reviewsService.submit({
                productId,
                orderId,
                rating,
                comment: comment.trim() || undefined,
            })
        },
        onSuccess: async () => {
            await Promise.all([
                queryClient.invalidateQueries({ queryKey: ['reviews', productId] }),
                queryClient.invalidateQueries({ queryKey: ['reviews', 'eligibility', productId] }),
            ])
            toast.success('Review submitted successfully')
            setRating(0)
            setComment('')
            onClose()
        },
        onError: (error) => {
            const message =
                error instanceof AxiosError
                    ? (error.response?.data as { message?: string } | undefined)?.message
                    : undefined
            toast.error(message ?? 'Could not submit review')
        },
    })

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[320] bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                >
                    <motion.div
                        className="absolute bottom-0 left-0 right-0 max-h-[80vh] overflow-y-auto rounded-t-[24px] bg-white p-5"
                        initial={{ y: '100%' }}
                        animate={{ y: 0 }}
                        exit={{ y: '100%' }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-center justify-between">
                            <h3 className="text-lg font-bold text-gray-900">Rate {productName}</h3>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                aria-label="Close review form"
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        <div className="mb-2 flex justify-center">
                            <RatingStars value={rating} onChange={setRating} size="lg" className="gap-1.5" />
                        </div>
                        <p className="mb-4 text-center text-sm font-medium text-gray-600">{selectedLabel}</p>

                        <div className="mb-2">
                            <textarea
                                value={comment}
                                onChange={(event) => setComment(event.target.value)}
                                placeholder="Share your experience..."
                                className="h-24 w-full resize-none rounded-xl border border-gray-200 px-4 py-3 text-sm text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                                maxLength={500}
                            />
                            <p className="mt-1 text-right text-xs text-gray-400">{comment.length}/500</p>
                        </div>

                        <button
                            type="button"
                            onClick={() => submitMutation.mutate()}
                            disabled={rating === 0 || submitMutation.isPending || !orderId}
                            className="inline-flex h-12 w-full items-center justify-center rounded-xl bg-green-500 text-sm font-semibold text-white transition-colors hover:bg-green-600 disabled:cursor-not-allowed disabled:opacity-60"
                        >
                            {submitMutation.isPending ? (
                                <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                            ) : (
                                'Submit Review'
                            )}
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
