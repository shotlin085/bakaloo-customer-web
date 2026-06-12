import { Search } from 'lucide-react'
import { EmptyState } from './EmptyState'

interface SearchEmptyProps {
    query?: string
}

export function SearchEmpty({ query }: SearchEmptyProps) {
    return (
        <EmptyState
            icon={Search}
            title={query ? `No results for "${query}"` : 'Search for products'}
            subtitle={
                query
                    ? 'Try a different search term or browse categories'
                    : 'Type to find groceries, snacks, and more'
            }
        />
    )
}
