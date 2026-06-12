'use client'

import Link from 'next/link'
import { ChevronDown, LifeBuoy } from 'lucide-react'
import { SHOPFRONT_VALUE_BAR } from '@/lib/shopfront/shopfront-content'

export function HeaderValueBar() {
  return (
    <div className="bg-[color:var(--shop-primary)] text-white">
      <div className="flex min-h-[40px] items-center justify-between gap-4 px-4 sm:px-6 lg:px-8">
        <p className="min-w-0 truncate text-center text-[11px] font-medium tracking-[0.01em] text-white/94 sm:flex-1 sm:text-[12px]">
          {SHOPFRONT_VALUE_BAR.message}
        </p>

        <div className="hidden shrink-0 items-center gap-5 text-[11px] font-medium text-white/88 lg:flex">
          <button
            type="button"
            className="inline-flex items-center gap-1.5"
            aria-label="Currency and language"
          >
            {SHOPFRONT_VALUE_BAR.locale}
            <ChevronDown className="h-3 w-3" />
          </button>
          <Link
            href={SHOPFRONT_VALUE_BAR.helpHref}
            className="inline-flex items-center gap-1.5 transition-opacity hover:opacity-100"
          >
            <LifeBuoy className="h-3.5 w-3.5" />
            {SHOPFRONT_VALUE_BAR.helpLabel}
          </Link>
        </div>
      </div>
    </div>
  )
}
