'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'
import { Home, LayoutGrid, ShoppingBasket, ClipboardList, User } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useCartStore } from '@/store/cart.store'

const TABS = [
    { href: '/', icon: Home, label: 'Home' },
    { href: '/categories', icon: LayoutGrid, label: 'Browse' },
    { href: '/cart', icon: ShoppingBasket, label: 'Cart', showBadge: true },
    { href: '/orders', icon: ClipboardList, label: 'Orders' },
    { href: '/profile', icon: User, label: 'Profile' },
]

export function BottomNav() {
    const pathname = usePathname()
    const cartCount = useCartStore((s) => s.count)

    return (
        <nav className="fixed bottom-0 left-0 right-0 z-[300] flex h-16 items-center border-t border-[color:var(--shop-border)] bg-[color:var(--shop-surface-elevated)] shadow-[0_-4px_16px_rgba(0,0,0,0.06)] pb-[env(safe-area-inset-bottom)] md:hidden">
            {TABS.map((tab) => {
                const isActive =
                    tab.href === '/' ? pathname === '/' : pathname.startsWith(tab.href)
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={cn(
                            'flex-1 flex flex-col items-center justify-center gap-0.5 py-1 relative min-h-[44px]',
                            isActive ? 'text-[color:var(--shop-primary)]' : 'text-[color:var(--shop-ink-muted)]/70',
                        )}
                    >
                        <div className="relative">
                            <tab.icon className="w-6 h-6" />
                            {tab.showBadge && cartCount > 0 && (
                                <span className="absolute -top-1.5 -right-2.5 flex h-[18px] min-w-[18px] items-center justify-center rounded-full bg-[color:var(--shop-primary)] px-1 text-[9px] font-bold text-white">
                                    {cartCount > 99 ? '99+' : cartCount}
                                </span>
                            )}
                        </div>
                        <span
                            className={cn(
                                'text-[10px]',
                                isActive ? 'font-semibold' : 'font-medium',
                            )}
                        >
                            {tab.label}
                        </span>
                        {/* Active dot — Blinkit style */}
                        {isActive && (
                            <div className="absolute bottom-1 h-1 w-1 rounded-full bg-[color:var(--shop-primary)]" />
                        )}
                    </Link>
                )
            })}
        </nav>
    )
}
