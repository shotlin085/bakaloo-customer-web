import { Star } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function ReviewsEmpty() {
    return (
        <EmptyState
            icon={Star}
            title="No reviews yet"
            subtitle="Be the first to review this product"
        />
    )
}
