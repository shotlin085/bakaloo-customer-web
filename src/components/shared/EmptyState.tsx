import type { LucideIcon } from 'lucide-react'
import { EmptyStateCard } from './EmptyStateCard'

interface EmptyStateProps {
    icon: LucideIcon
    title: string
    subtitle: string
    ctaLabel?: string
    ctaHref?: string
}

export function EmptyState({ icon: Icon, title, subtitle, ctaLabel, ctaHref }: EmptyStateProps) {
    return (
        <EmptyStateCard
            icon={Icon}
            title={title}
            subtitle={subtitle}
            ctaLabel={ctaLabel}
            ctaHref={ctaHref}
        />
    )
}
