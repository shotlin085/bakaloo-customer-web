'use client'

import { useRouter } from 'next/navigation'
import {
    Bell,
    ChevronRight,
    Gift,
    Heart,
    LogOut,
    MapPin,
    ShoppingBag,
    Star,
    Trash2,
    Wallet,
} from 'lucide-react'
import { formatINR } from '@/lib/utils'
import type { LucideIcon } from 'lucide-react'

interface MenuItem {
    icon: LucideIcon
    label: string
    href?: string
    value?: string
    onClick?: () => void
}

interface ProfileMenuProps {
    walletBalance?: number
    loyaltyPoints?: number
    referralCode?: string
    onLogout: () => void
    onDeleteAccount: () => void
}

export function ProfileMenu({
    walletBalance,
    loyaltyPoints,
    referralCode,
    onLogout,
    onDeleteAccount,
}: ProfileMenuProps) {
    const router = useRouter()

    const menuItems: MenuItem[] = [
        { icon: ShoppingBag, label: 'My Orders', href: '/orders' },
        { icon: MapPin, label: 'Addresses', href: '/profile/addresses' },
        { icon: Heart, label: 'Wishlist', href: '/wishlist' },
        {
            icon: Wallet,
            label: 'Wallet',
            href: '/wallet',
            value: walletBalance !== undefined ? formatINR(walletBalance) : undefined,
        },
        { icon: Bell, label: 'Notifications', href: '/notifications' },
        { icon: Star, label: 'My Reviews', href: '/profile/reviews' },
        {
            icon: Gift,
            label: 'Referral Code',
            value: referralCode,
            onClick: () => {
                if (!referralCode || typeof navigator === 'undefined') return
                void navigator.clipboard.writeText(referralCode)
            },
        },
    ]

    return (
        <div className="space-y-1">
            {typeof loyaltyPoints === 'number' && (
                <div className="rounded-xl bg-amber-50 px-4 py-2.5 text-xs font-medium text-amber-700">
                    Loyalty Points: <span className="font-semibold">{loyaltyPoints}</span>
                </div>
            )}

            {menuItems.map((item) => {
                const content = (
                    <div className="flex items-center gap-3 rounded-xl px-4 py-3.5 transition-colors hover:bg-gray-50">
                        <item.icon className="h-5 w-5 text-gray-400" strokeWidth={1.5} />
                        <span className="flex-1 text-sm font-medium text-gray-700">{item.label}</span>
                        {item.value && <span className="text-sm font-semibold text-gray-500">{item.value}</span>}
                        <ChevronRight className="h-4 w-4 text-gray-300" />
                    </div>
                )

                if (item.href) {
                    return (
                        <button
                            key={item.label}
                            onClick={() => {
                                item.onClick?.()
                                router.push(item.href!)
                            }}
                            className="w-full text-left"
                            type="button"
                        >
                            {content}
                        </button>
                    )
                }

                return (
                    <button key={item.label} onClick={item.onClick} className="w-full text-left" type="button">
                        {content}
                    </button>
                )
            })}

            <div className="my-2 border-t border-gray-100" />

            <button
                onClick={onLogout}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-red-50"
                type="button"
            >
                <LogOut className="h-5 w-5 text-red-400" strokeWidth={1.5} />
                <span className="text-sm font-medium text-red-500">Log Out</span>
            </button>

            <button
                onClick={onDeleteAccount}
                className="flex w-full items-center gap-3 rounded-xl px-4 py-3.5 text-left transition-colors hover:bg-red-50"
                type="button"
            >
                <Trash2 className="h-5 w-5 text-red-300" strokeWidth={1.5} />
                <span className="text-sm font-medium text-red-400">Delete Account</span>
            </button>
        </div>
    )
}
