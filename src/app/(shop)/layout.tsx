'use client'

import { usePathname } from 'next/navigation'
import { BottomNav } from '@/components/layout/BottomNav'
import { ShopFooter } from '@/components/layout/ShopFooter'
import { ShopHeader } from '@/components/layout/ShopHeader'
import { ErrorBoundary } from '@/components/shared/ErrorBoundary'

export default function ShopLayout({
    children,
}: {
    children: React.ReactNode
}) {
    const pathname = usePathname()
    const hideFooterChrome = pathname === '/cart'

    return (
        <div className="min-h-screen warm-canvas">
            <div className="pointer-events-none fixed inset-0 bg-[radial-gradient(circle_at_top,rgba(255,255,255,0.58),transparent_44%)]" />

            <div className={`relative w-full ${hideFooterChrome ? 'pb-8' : 'pb-24 lg:pb-6'}`}>
                <div className="flex min-h-screen flex-col">
                    <ShopHeader />
                    <main className={`flex-1 overflow-x-hidden ${hideFooterChrome ? 'pb-6' : 'pb-10 lg:pb-4'}`}>
                        <ErrorBoundary>{children}</ErrorBoundary>
                    </main>
                    {!hideFooterChrome && <ShopFooter />}
                </div>
            </div>
            {!hideFooterChrome && <BottomNav />}
        </div>
    )
}
