'use client'

import { useEffect, useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { MessageSquareText, Star, Trash2 } from 'lucide-react'
import { toast } from 'sonner'
import { QUERY_KEYS } from '@/lib/constants'
import { reviewsService } from '@/services/reviews.service'
import { RatingStars } from '@/components/shared/RatingStars'
import { timeAgo } from '@/lib/utils'

interface ReviewItem {
    id: string
    product_name?: string
    rating: number
    comment: string
    created_at: string
}

export default function ProfileReviewsPage() {
    const queryClient = useQueryClient()
    const [deletingId, setDeletingId] = useState<string | null>(null)

    useEffect(() => {
        document.title = 'My Reviews — Bakaloo'
    }, [])

    const { data, isLoading } = useQuery({
        queryKey: QUERY_KEYS.myReviews,
        queryFn: () => reviewsService.getMyReviews(),
    })

    const deleteMutation = useMutation({
        mutationFn: async (id: string) => {
            setDeletingId(id)
            await reviewsService.deleteReview(id)
        },
        onSuccess: async () => {
            await queryClient.invalidateQueries({ queryKey: QUERY_KEYS.myReviews })
            toast.success('Review deleted')
        },
        onError: () => {
            toast.error('Could not delete review')
        },
        onSettled: () => {
            setDeletingId(null)
        },
    })

    const reviews = Array.isArray(data?.reviews) ? (data.reviews as ReviewItem[]) : []

    return (
        <div className="page-enter px-6 py-6 pb-24">
            <h1 className="mb-5 text-2xl font-bold text-gray-900">My Reviews</h1>

            {isLoading ? (
                <div className="space-y-3">
                    {Array.from({ length: 5 }).map((_, index) => (
                        <div key={index} className="skeleton-shimmer h-[142px] rounded-xl" />
                    ))}
                </div>
            ) : reviews.length === 0 ? (
                <div className="rounded-2xl border border-dashed border-gray-200 bg-white px-6 py-12 text-center">
                    <Star className="mx-auto mb-3 h-10 w-10 text-gray-300" strokeWidth={1.5} />
                    <h2 className="text-base font-bold text-gray-900">No reviews yet</h2>
                    <p className="mt-1 text-sm text-gray-500">Start reviewing your purchases</p>
                </div>
            ) : (
                <div className="space-y-3">
                    {reviews.map((review) => {
                        const isDeleting = deletingId === review.id && deleteMutation.isPending

                        return (
                            <article
                                key={review.id}
                                className="rounded-xl border border-gray-100 bg-white p-4 shadow-sm"
                            >
                                <div className="flex items-start justify-between gap-3">
                                    <div className="min-w-0">
                                        <p className="text-sm font-semibold text-gray-900">
                                            {review.product_name || 'Product review'}
                                        </p>
                                        <RatingStars
                                            value={Number(review.rating ?? 0)}
                                            size="sm"
                                            className="mt-1"
                                        />
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => deleteMutation.mutate(review.id)}
                                        disabled={isDeleting}
                                        className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-xs text-red-500 transition-colors hover:bg-red-50 hover:underline disabled:cursor-not-allowed disabled:opacity-60"
                                    >
                                        <Trash2 className="h-3.5 w-3.5" strokeWidth={1.5} />
                                        {isDeleting ? 'Deleting...' : 'Delete'}
                                    </button>
                                </div>

                                <p className="mt-3 text-sm leading-6 text-gray-600">
                                    {review.comment?.trim() ? review.comment : 'No comment added.'}
                                </p>

                                <div className="mt-3 flex items-center gap-1 text-xs text-gray-400">
                                    <MessageSquareText className="h-3.5 w-3.5" strokeWidth={1.5} />
                                    <span>{timeAgo(review.created_at)}</span>
                                </div>
                            </article>
                        )
                    })}
                </div>
            )}
        </div>
    )
}
