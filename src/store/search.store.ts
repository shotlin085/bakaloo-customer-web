import { create } from 'zustand'
import { persist, createJSONStorage } from 'zustand/middleware'

interface SearchState {
    recentSearches: string[]
    addSearch: (q: string) => void
    removeSearch: (q: string) => void
    clearSearches: () => void
}

export const useSearchStore = create<SearchState>()(
    persist(
        (set) => ({
            recentSearches: [],
            addSearch: (q) =>
                set((s) => ({
                    recentSearches: [q.trim(), ...s.recentSearches.filter((s2) => s2 !== q.trim())]
                        .filter(Boolean)
                        .slice(0, 6),
                })),
            removeSearch: (q) =>
                set((s) => ({
                    recentSearches: s.recentSearches.filter((s2) => s2 !== q),
                })),
            clearSearches: () => set({ recentSearches: [] }),
        }),
        {
            name: 'bakaloo-searches',
            storage: createJSONStorage(() => localStorage),
        },
    ),
)
