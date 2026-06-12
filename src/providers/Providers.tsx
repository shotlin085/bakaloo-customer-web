'use client'

import { QueryProvider } from './QueryProvider'
import { AuthProvider } from './AuthProvider'
import { SocketProvider } from './SocketProvider'
import { Toaster } from '@/components/ui/sonner'
import { ShopThemeProvider } from '@/components/theme/ShopThemeProvider'

export function Providers({ children }: { children: React.ReactNode }) {
    return (
        <QueryProvider>
            <AuthProvider>
                <SocketProvider>
                    <ShopThemeProvider>
                        {children}
                        <Toaster
                            position="top-right"
                            toastOptions={{
                                classNames: {
                                    toast: 'bg-white border border-gray-100 shadow-lg rounded-xl',
                                    title: 'text-sm font-medium text-gray-900',
                                    description: 'text-xs text-gray-500',
                                },
                            }}
                            richColors
                            closeButton
                            duration={3000}
                        />
                    </ShopThemeProvider>
                </SocketProvider>
            </AuthProvider>
        </QueryProvider>
    )
}
