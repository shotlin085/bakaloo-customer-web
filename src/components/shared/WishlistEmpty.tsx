import { Heart } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function WishlistEmpty() {
    return (
        <EmptyState
            icon={Heart}
            title="Your wishlist is empty"
            subtitle="Save items you love for later"
            ctaLabel="Browse Products"
            ctaHref="/products"
        />
    )
}
