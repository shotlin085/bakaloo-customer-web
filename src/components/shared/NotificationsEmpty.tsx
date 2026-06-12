import { Bell } from 'lucide-react'
import { EmptyState } from './EmptyState'

export function NotificationsEmpty() {
    return (
        <EmptyState
            icon={Bell}
            title="You're all caught up!"
            subtitle="No new notifications right now"
        />
    )
}
