import { ShoppingBag } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function OrdersEmpty() {
    return (
        <EmptyState
            icon={ShoppingBag}
            title="No orders yet"
            subtitle="Place your first order and it will show up here"
            ctaLabel="Start Shopping"
            ctaHref="/"
        />
    )
}
