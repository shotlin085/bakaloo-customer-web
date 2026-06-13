import type { Metadata, Viewport } from 'next'
import { Plus_Jakarta_Sans } from 'next/font/google'
import './globals.css'
import { Providers } from '@/providers/Providers'

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  display: 'swap',  // Prevents layout shift while font loads
})

export const metadata: Metadata = {
  title: {
    default: 'Bakaloo | Fresh Groceries Delivered',
    template: '%s | Bakaloo',
  },
  description:
    'Order fresh groceries online. Fast delivery to your doorstep. Fresh fruits, vegetables, dairy, snacks and more.',
  keywords: ['grocery', 'online grocery', 'fresh food', 'delivery', 'bakaloo'],
  // PWA — apple touch icon
  icons: {
    icon: [
      { url: '/icon-192.png', sizes: '192x192', type: 'image/png' },
      { url: '/icon-512.png', sizes: '512x512', type: 'image/png' },
    ],
    apple: [{ url: '/apple-touch-icon.png', sizes: '180x180' }],
  },
  openGraph: {
    title: 'Bakaloo',
    description: 'Fresh groceries delivered to your doorstep',
    type: 'website',
    locale: 'en_IN',
    siteName: 'Bakaloo',
  },
  // Enables "Add to Home Screen" on iOS Safari
  appleWebApp: {
    capable: true,
    statusBarStyle: 'default',
    title: 'Bakaloo',
  },
}

// Separate viewport export per Next.js 14 recommendation
export const viewport: Viewport = {
  themeColor: '#22C55E',
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body className={`${plusJakartaSans.className} min-h-screen antialiased`}>
        <Providers>{children}</Providers>
      </body>
    </html>
  )
}
