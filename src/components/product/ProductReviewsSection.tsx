'use client'

import { useEffect, useMemo, useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { Star } from 'lucide-react'
import { reviewsService } from '@/services/reviews.service'
import { QUERY_KEYS } from '@/lib/queryKeys'
import { RatingStars } from '@/components/shared/RatingStars'
import { ReviewForm } from '@/components/product/ReviewForm'
import { useAuthStore } from '@/store/auth.store'
import { formatDate } from '@/lib/utils'
import type { Pagination } from '@/types/api.types'

interface ProductReviewsSectionProps {
    productId: string
    initialData?: unknown
}

interface ReviewItem {
    id: string
    product_name?: string
    order_id?: string
    user_name?: string
    rating?: number
    comment?: string
    created_at?: string
}

interface ReviewsQueryData {
    reviews: ReviewItem[]
    averageRating: number
    pagination: Pagination
}

export function ProductReviewsSection({ productId, initialData }: ProductReviewsSectionProps) {
    const [page, setPage] = useState(1)
    const [allReviews, setAllReviews] = useState<ReviewItem[]>([])
    const [showReviewForm, setShowReviewForm] = useState(false)
    const { user } = useAuthStore()

    const normalizedInitialData = useMemo<ReviewsQueryData | undefined>(() => {
        if (!initialData || typeof initialData !== 'object') return undefined
        const raw = initialData as Record<string, unknown>
        const rawPagination = raw.pagination as Partial<Pagination> | undefined
        return {
            reviews: Array.isArray(raw.reviews) ? (raw.reviews as ReviewItem[]) : [],
            averageRating: Number(raw.averageRating ?? raw.average_rating ?? 0),
            pagination: {
                page: Number(rawPagination?.page) || 1,
                limit: Number(rawPagination?.limit) || 6,
                total: Number(rawPagination?.total) || 0,
                totalPages: Number(rawPagination?.totalPages) || 1,
            },
        }
    }, [initialData])

    const { data, isLoading, isFetching, isError } = useQuery({
        queryKey: QUERY_KEYS.reviews(productId, page),
        queryFn: () => reviewsService.getForProduct(productId, page, 6),
        enabled: Boolean(productId),
        staleTime: 2 * 60 * 1000,
        ...(page === 1 && normalizedInitialData ? { initialData: normalizedInitialData } : {}),
    })

    const { data: eligibility } = useQuery({
        queryKey: QUERY_KEYS.reviewEligibility(productId, user?.id ?? null),
        queryFn: () => reviewsService.checkEligibility(productId),
        enabled: Boolean(user?.id && productId),
        staleTime: 5 * 60 * 1000,
    })

    useEffect(() => {
        if (!data?.reviews) return
        setAllReviews((prev) => {
            if (page === 1) return data.reviews as ReviewItem[]
            const seen = new Set(prev.map((review) => review.id))
            const incoming = (data.reviews as ReviewItem[]).filter((review) => !seen.has(review.id))
            return [...prev, ...incoming]
        })
    }, [data?.reviews, page])

    const averageRating = Number(data?.averageRating ?? 0)
    const totalLoaded = allReviews.length
    const hasReviews = totalLoaded > 0
    const pagination = data?.pagination
    const hasMore = Boolean(pagination && pagination.page < pagination.totalPages)
    const eligibleOrderId = eligibility?.orderId ?? undefined
    const canReview = Boolean(user && eligibility?.eligible)
    const productName =
        allReviews.find((review) => review.product_name?.trim())?.product_name || 'this product'

    const breakdown = useMemo(() => {
        const counts: Record<number, number> = { 5: 0, 4: 0, 3: 0, 2: 0, 1: 0 }
        allReviews.forEach((review) => {
            const value = Math.round(Number(review.rating ?? 0))
            if (value >= 1 && value <= 5) counts[value] = (counts[value] ?? 0) + 1
        })
        return [5, 4, 3, 2, 1].map((star) => ({
            star,
            count: counts[star] ?? 0,
            percent: totalLoaded ? Math.round(((counts[star] ?? 0) / totalLoaded) * 100) : 0,
        }))
    }, [allReviews, totalLoaded])

    if (isLoading && !hasReviews) {
        return (
            <section className="border-t border-gray-100 pt-5">
                <h3 className="mb-4 text-sm font-bold text-gray-900">Customer Reviews</h3>
                <div className="grid gap-4 lg:grid-cols-[220px_1fr]">
                    <div className="skeleton-shimmer h-[160px] rounded-2xl" />
                    <div className="space-y-3">
                        <div className="skeleton-shimmer h-16 rounded-xl" />
                        <div className="skeleton-shimmer h-16 rounded-xl" />
                        <div className="skeleton-shimmer h-16 rounded-xl" />
                    </div>
                </div>
            </section>
        )
    }

    return (
        <section className="border-t border-gray-100 pt-5">
            <h3 className="mb-4 text-sm font-bold text-gray-900">Customer Reviews</h3>

            {!hasReviews && !isFetching ? (
                <div className="rounded-2xl border border-gray-100 bg-white px-4 py-8 text-center">
                    <Star className="mx-auto mb-2 h-8 w-8 text-amber-300" strokeWidth={1.5} />
                    <p className="text-sm font-semibold text-gray-700">No reviews yet</p>
                    <p className="mt-1 text-xs text-gray-500">
                        {canReview
                            ? 'You purchased this product — share your experience!'
                            : 'Reviews from verified buyers will appear here.'}
                    </p>
                </div>
            ) : (
                <div className="grid gap-5 lg:grid-cols-[220px_1fr]">
                    <div className="rounded-2xl border border-gray-100 bg-white p-4 text-center">
                        <p className="text-[40px] font-black leading-none text-gray-900">
                            {averageRating.toFixed(1)}
                        </p>
                        <RatingStars value={averageRating} size="md" className="mt-2 justify-center" />
                        <p className="mt-2 text-xs text-gray-500">{totalLoaded} reviews</p>
                    </div>

                    <div className="space-y-2">
                        {breakdown.map((entry) => (
                            <div key={entry.star} className="flex items-center gap-2.5">
                                <span className="w-5 text-xs font-semibold text-gray-600">{entry.star}★</span>
                                <div className="h-2 flex-1 overflow-hidden rounded-full bg-gray-100">
                                    <div
                                        className="h-full rounded-full bg-amber-400 transition-all"
                                        style={{ width: `${entry.percent}%` }}
                                    />
                                </div>
                                <span className="w-8 text-right text-xs text-gray-500">{entry.percent}%</span>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {hasReviews && (
                <div className="mt-4 max-h-[420px] overflow-y-auto rounded-2xl border border-gray-100 bg-white px-4">
                    {allReviews.map((review) => {
                        const reviewerName = review.user_name?.trim() || 'Guest'
                        const initial = reviewerName[0]?.toUpperCase() ?? 'G'

                        return (
                            <article key={review.id} className="border-b border-gray-50 py-4 last:border-b-0">
                                <div className="mb-2 flex items-start gap-3">
                                    <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-green-100 text-sm font-bold text-green-700">
                                        {initial}
                                    </div>
                                    <div className="min-w-0 flex-1">
                                        <div className="flex flex-wrap items-center gap-2">
                                            <p className="text-sm font-semibold text-gray-900">{reviewerName}</p>
                                            <span className="text-xs text-gray-400">
                                                {review.created_at ? formatDate(review.created_at) : ''}
                                            </span>
                                        </div>
                                        <RatingStars value={Number(review.rating ?? 0)} size="sm" className="mt-1" />
                                    </div>
                                </div>
                                <p className="text-sm leading-relaxed text-gray-600">
                                    {review.comment?.trim() || 'No written comment.'}
                                </p>
                            </article>
                        )
                    })}
                </div>
            )}

            {isError && (
                <p className="mt-3 text-xs font-medium text-red-500">
                    Could not load all reviews right now.
                </p>
            )}

            {hasMore && (
                <button
                    type="button"
                    onClick={() => setPage((prev) => prev + 1)}
                    disabled={isFetching}
                    className="mt-4 rounded-full border border-gray-200 bg-white px-4 py-2 text-sm font-semibold text-gray-700 transition-colors hover:border-gray-300 hover:bg-gray-50 disabled:cursor-not-allowed disabled:opacity-60"
                >
                    {isFetching ? 'Loading...' : 'Show more'}
                </button>
            )}

            {canReview && (
                <button
                    type="button"
                    onClick={() => setShowReviewForm(true)}
                    className="mt-4 text-sm font-semibold text-green-600 hover:text-green-700 hover:underline"
                >
                    ✍️ Write a Review
                </button>
            )}

            {user && eligibility?.alreadyReviewed && (
                <p className="mt-3 text-xs font-medium text-gray-400">
                    ✓ You&apos;ve already reviewed this product.
                </p>
            )}

            {user && (
                <ReviewForm
                    isOpen={showReviewForm}
                    onClose={() => setShowReviewForm(false)}
                    productId={productId}
                    productName={productName}
                    orderId={eligibleOrderId}
                />
            )}
        </section>
    )
}
