'use client'

import type { MouseEvent } from 'react'
import { usePathname, useRouter } from 'next/navigation'
import { Heart } from 'lucide-react'
import { motion } from 'framer-motion'
import { cn } from '@/lib/utils'
import { useWishlist } from '@/hooks/useWishlist'
import { useAuthStore } from '@/store/auth.store'

interface WishlistButtonProps {
    productId: string
    className?: string
}

export function WishlistButton({ productId, className }: WishlistButtonProps) {
    const { toggleWishlist, isInWishlist } = useWishlist()
    const isLoggedIn = useAuthStore((s) => s.isLoggedIn)
    const router = useRouter()
    const pathname = usePathname()
    const active = isInWishlist(productId)

    const handleClick = (event: MouseEvent<HTMLButtonElement>) => {
        event.preventDefault()
        event.stopPropagation()

        if (!isLoggedIn) {
            const query = typeof window !== 'undefined' ? window.location.search : ''
            const redirectPath = query ? `${pathname}${query}` : pathname
            router.push(`/login?redirect=${encodeURIComponent(redirectPath)}`)
            return
        }

        toggleWishlist(productId)
    }

    return (
        <motion.button
            type="button"
            onClick={handleClick}
            whileTap={{ scale: 0.9 }}
            className={cn(
                'flex h-9 w-9 items-center justify-center rounded-full border border-black/5 bg-white/85 text-gray-400 shadow-sm backdrop-blur-sm transition-colors',
                active ? 'text-red-500' : 'hover:text-gray-600',
                className,
            )}
            aria-label={active ? 'Remove from wishlist' : 'Add to wishlist'}
        >
            <Heart
                className="h-[18px] w-[18px]"
                strokeWidth={1.5}
                fill={active ? 'currentColor' : 'none'}
            />
        </motion.button>
    )
}
