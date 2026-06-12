'use client'

import { useAuthStore } from '@/store/auth.store'

interface LoyaltyTier {
    name: string
    minPoints: number
    earnRate: number
    color: string
}

const TIERS: LoyaltyTier[] = [
    { name: 'Bronze', minPoints: 0, earnRate: 1, color: '#CD7F32' },
    { name: 'Silver', minPoints: 500, earnRate: 1.5, color: '#C0C0C0' },
    { name: 'Gold', minPoints: 1000, earnRate: 2, color: '#FFD700' },
]

type UserWithLegacyPoints = {
    loyalty_points?: number
    loyaltyPoints?: number
} | null

export function useLoyaltyPoints() {
    const user = useAuthStore((state) => state.user) as UserWithLegacyPoints
    const points = user?.loyalty_points ?? user?.loyaltyPoints ?? 0

    const currentTier = [...TIERS].reverse().find((tier) => points >= tier.minPoints) ?? TIERS[0]!
    const nextTier = TIERS.find((tier) => tier.minPoints > points)
    const pointsToNext = nextTier ? nextTier.minPoints - points : 0
    const progress = nextTier
        ? ((points - currentTier.minPoints) / (nextTier.minPoints - currentTier.minPoints)) * 100
        : 100

    const pointsValue = Math.floor(points / 10)

    return { points, currentTier, nextTier, pointsToNext, progress, pointsValue }
}
