'use client'

import { useAuthStore } from '@/store/auth.store'
import { useQuery } from '@tanstack/react-query'
import { keys, STALE } from '@/lib/queryKeys'
import { formatINR } from '@/lib/utils'
import { authService } from '@/services/auth.service'
import { ReferralCard } from '@/components/profile/ReferralCard'
import { DeleteAccountDialog } from '@/components/profile/DeleteAccountDialog'
import { LoyaltyPointsBadge } from '@/components/shared/LoyaltyPointsBadge'
import { Avatar, AvatarFallback, AvatarImage } from '@/components/ui/avatar'
import { MapPin, Heart, Wallet, ClipboardList, Bell, LogOut, ChevronRight, Settings, Shield, Star, HelpCircle } from 'lucide-react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { useEffect, useState } from 'react'

const MENU_ITEMS = [
    { href: '/orders', icon: ClipboardList, label: 'My Orders', desc: 'Track, return, or buy again', color: 'text-blue-500 bg-blue-50' },
    { href: '/wishlist', icon: Heart, label: 'Wishlist', desc: 'Your saved items', color: 'text-pink-500 bg-pink-50' },
    { href: '/wallet', icon: Wallet, label: 'Wallet', desc: 'Check balance & transactions', color: 'text-emerald-500 bg-emerald-50' },
    { href: '/profile/addresses', icon: MapPin, label: 'Addresses', desc: 'Manage delivery addresses', color: 'text-orange-500 bg-orange-50' },
    { href: '/notifications', icon: Bell, label: 'Notifications', desc: 'Stay up to date', color: 'text-purple-500 bg-purple-50' },
    { href: '/profile/reviews', icon: Star, label: 'My Reviews', desc: 'Your product reviews', color: 'text-yellow-500 bg-yellow-50' },
]

const SETTINGS_ITEMS = [
    { href: '/profile/edit', icon: Settings, label: 'Account Settings', color: 'text-gray-500 bg-gray-100' },
    { href: '#', icon: Shield, label: 'Privacy & Security', color: 'text-teal-500 bg-teal-50' },
    { href: '#', icon: HelpCircle, label: 'Help & Support', color: 'text-indigo-500 bg-indigo-50' },
]

export default function ProfilePage() {
    const { user, logout } = useAuthStore()
    const router = useRouter()
    const [showDelete, setShowDelete] = useState(false)

    useEffect(() => {
        document.title = 'My Profile — Bakaloo'
    }, [])

    const { data: stats } = useQuery({
        queryKey: keys.userStats(),
        queryFn: authService.getStats,
        staleTime: STALE.user,
    })

    const initials = user?.name?.charAt(0)?.toUpperCase() ?? 'U'

    return (
        <div className="page-enter pb-24">
            {/* ── Gradient Profile Header ── */}
            <div className="relative overflow-hidden">
                <div className="shop-hero-surface px-6 pt-8 pb-16">
                    {/* Decorative circles */}
                    <div className="absolute -top-10 -right-10 w-40 h-40 bg-white/5 rounded-full" />
                    <div className="absolute top-20 -left-8 w-28 h-28 bg-white/5 rounded-full" />

                    <div className="relative flex items-center gap-4">
                        <Avatar className="w-[68px] h-[68px] border-[3px] border-white/30 shadow-lg">
                            <AvatarImage src={user?.avatar_url ?? undefined} alt={user?.name ?? 'User'} />
                            <AvatarFallback className="bg-white text-[color:var(--shop-primary)] text-2xl font-bold">
                                {initials}
                            </AvatarFallback>
                        </Avatar>
                        <div className="flex-1">
                            <h1 className="text-xl font-extrabold text-white">{user?.name ?? 'Guest User'}</h1>
                            <p className="text-sm text-white/70">{user?.phone ?? ''}</p>
                        </div>
                        <Link
                            href="/profile/edit"
                            className="rounded-lg bg-white/15 px-4 py-2 text-xs font-medium text-white backdrop-blur transition-colors hover:bg-white/25"
                        >
                            Edit
                        </Link>
                    </div>
                </div>

                {/* Stats cards overlapping the gradient */}
                {stats && (
                    <div className="px-6 -mt-10 relative z-10">
                        <div className="grid grid-cols-3 gap-3">
                            {[
                                { value: stats.total_orders, label: 'Orders', color: 'text-gray-900', key: 'orders' },
                                { value: formatINR(stats.total_spent), label: 'Total Spent', color: 'text-green-600', key: 'spent' },
                                { value: stats.loyalty_points, label: 'Points', color: 'text-amber-500', key: 'points' },
                            ].map(({ value, label, color, key }) => (
                                <div key={label} className="bg-white rounded-2xl border border-gray-100 shadow-sm p-4 text-center">
                                    <p className={`text-lg font-extrabold ${color}`}>{value}</p>
                                    <p className="text-xs text-gray-400 mt-0.5">{label}</p>
                                    {key === 'points' && Number(stats.loyalty_points) > 0 && (
                                        <div className="mt-1.5 flex justify-center">
                                            <LoyaltyPointsBadge points={Number(stats.loyalty_points)} size="sm" />
                                        </div>
                                    )}
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </div>

            {/* ── Bakaloo Pass Promo ── */}
            <div className="px-6 mt-6">
                <div className="shop-promo-surface flex items-center gap-3 rounded-2xl border border-[color:var(--shop-border)] p-4">
                    <div className="w-10 h-10 bg-amber-100 rounded-xl flex items-center justify-center flex-shrink-0">
                        <Star className="w-5 h-5 text-amber-500" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm font-semibold text-amber-900">Bakaloo Pass</p>
                        <p className="text-xs text-amber-700">Get free delivery on every order</p>
                    </div>
                    <ChevronRight className="w-5 h-5 text-amber-400" />
                </div>
            </div>

            {user?.referral_code && (
                <div className="px-6 mt-6">
                    <ReferralCard referralCode={user.referral_code} />
                </div>
            )}

            {/* ── Main Menu ── */}
            <div className="px-6 mt-6">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                    {MENU_ITEMS.map((item) => (
                        <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 active:bg-gray-100 transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                                <p className="text-sm font-semibold text-gray-900">{item.label}</p>
                                <p className="text-xs text-gray-400">{item.desc}</p>
                            </div>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                    ))}
                </div>
            </div>

            {/* ── Settings ── */}
            <div className="px-6 mt-4">
                <div className="bg-white rounded-2xl border border-gray-100 shadow-sm divide-y divide-gray-50 overflow-hidden">
                    {SETTINGS_ITEMS.map((item) => (
                        <Link
                            key={item.label}
                            href={item.href}
                            className="flex items-center gap-4 px-5 py-4 hover:bg-gray-50 transition-colors"
                        >
                            <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${item.color}`}>
                                <item.icon className="w-5 h-5" />
                            </div>
                            <span className="flex-1 text-sm font-medium text-gray-900">{item.label}</span>
                            <ChevronRight className="w-4 h-4 text-gray-400" />
                        </Link>
                    ))}
                </div>
            </div>

            <div className="px-6 mt-6 mb-2">
                <button
                    type="button"
                    onClick={() => setShowDelete(true)}
                    className="w-full rounded-xl border border-red-200 py-3 text-sm font-medium text-red-500 transition-colors hover:bg-red-50 hover:text-red-600"
                >
                    Delete Account
                </button>
            </div>

            {/* ── Logout ── */}
            <div className="px-6 mt-4">
                <button
                    onClick={async () => {
                        await authService.logout()
                        logout()
                        router.push('/login')
                    }}
                    className="w-full flex items-center gap-4 px-5 py-4 bg-white rounded-2xl border border-gray-100 shadow-sm hover:bg-red-50 active:bg-red-100 transition-colors"
                >
                    <div className="w-10 h-10 rounded-xl flex items-center justify-center bg-red-50 text-red-500">
                        <LogOut className="w-5 h-5" />
                    </div>
                    <span className="text-sm font-semibold text-red-500">Log Out</span>
                </button>
            </div>

            {/* ── Version ── */}
            <p className="text-center text-xs text-gray-300 mt-8">v1.0.0 · Made with 💚 by Bakaloo</p>

            <DeleteAccountDialog isOpen={showDelete} onClose={() => setShowDelete(false)} />
        </div>
    )
}
