'use client'

import { usePathname } from 'next/navigation'
import { Header } from '@/components/layout/Header'
import { HeaderCategoryNav } from '@/components/layout/HeaderCategoryNav'
import { HeaderValueBar } from '@/components/layout/HeaderValueBar'

export function ShopHeader() {
  const pathname = usePathname()
  const isHomePage = pathname === '/'

  return (
    <>
      {isHomePage && <HeaderValueBar />}
      <div className="sticky top-0 z-[190] bg-white/96 backdrop-blur-[10px]">
        <Header />
      </div>
      {isHomePage && <HeaderCategoryNav />}
    </>
  )
}
