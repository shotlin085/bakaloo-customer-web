import { NextResponse } from 'next/server'
import type { NextRequest } from 'next/server'

const PROTECTED = ['/cart', '/checkout', '/orders', '/profile', '/wallet', '/wishlist', '/notifications']
const AUTH_ONLY = ['/login', '/otp']

export function middleware(req: NextRequest) {
    const token = req.cookies.get('accessToken')?.value
    const path = req.nextUrl.pathname
    const isProtected = PROTECTED.some((p) => path.startsWith(p))
    const isAuthOnly = AUTH_ONLY.some((p) => path.startsWith(p))

    if (isProtected && !token) {
        const url = new URL('/login', req.url)
        url.searchParams.set('redirect', path)
        return NextResponse.redirect(url)
    }

    if (isAuthOnly && token) {
        return NextResponse.redirect(new URL('/', req.url))
    }

    return NextResponse.next()
}

export const config = {
    matcher: ['/((?!api|_next/static|_next/image|favicon.ico|robots.txt|sitemap.xml).*)'],
}
