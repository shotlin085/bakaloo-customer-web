'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import { ShoppingBasket } from 'lucide-react'
import { useCartStore } from '@/store/cart.store'
import { cn } from '@/lib/utils'

export function HeaderCartButton() {
    const count = useCartStore((state) => state.count)
    const prevCount = useRef(count)
    const [pop, setPop] = useState(false)

    useEffect(() => {
        let timeout: ReturnType<typeof setTimeout> | undefined

        if (count > prevCount.current) {
            setPop(true)
            timeout = setTimeout(() => setPop(false), 320)
        }

        prevCount.current = count

        return () => {
            if (timeout) clearTimeout(timeout)
        }
    }, [count])

    const display = count > 9 ? '9+' : `${count}`

    return (
        <Link
            href="/cart"
            className={cn(
                'relative inline-flex h-11 w-11 items-center justify-center rounded-full border border-[rgba(17,24,39,0.08)] bg-white text-[color:var(--shop-ink)] transition-colors duration-200 hover:border-[rgba(75,0,130,0.18)] hover:text-[color:var(--shop-primary)]',
            )}
            aria-label={`Open cart with ${display} items`}
        >
            <ShoppingBasket className={cn('h-[18px] w-[18px]', pop && 'cart-bounce-soft')} strokeWidth={1.9} />
            <span className={cn('absolute -left-1 -top-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-[color:var(--shop-accent)] px-1 text-[10px] font-bold leading-none text-[#241D05]', pop && 'cart-pop')}>
                {display}
            </span>
        </Link>
    )
}
