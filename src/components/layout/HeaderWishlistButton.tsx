'use client'

import Link from 'next/link'
import { Heart } from 'lucide-react'
import { useWishlistStore } from '@/store/wishlist.store'

export function HeaderWishlistButton() {
  const count = useWishlistStore((state) => state.count)
  const display = count > 9 ? '9+' : `${count}`

  return (
    <Link
      href="/wishlist"
      className="relative flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white text-[color:var(--shop-ink)] transition-colors hover:border-[rgba(75,0,130,0.18)] hover:text-[color:var(--shop-primary)] active:scale-95"
      aria-label={`Wishlist (${display} items)`}
    >
      <Heart className="h-[18px] w-[18px]" strokeWidth={1.8} />
      <span className="absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--shop-accent)] px-1 text-[10px] font-bold leading-none text-[#241D05]">
        {display}
      </span>
    </Link>
  )
}
