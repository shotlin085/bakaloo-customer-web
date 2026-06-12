export interface LoyaltyInfo {
    points: number
    tier: 'BRONZE' | 'SILVER' | 'GOLD'
    pointsToNext: number
    earnRate: number
}
