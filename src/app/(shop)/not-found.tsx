import Link from 'next/link'
import { Search } from 'lucide-react'

export default function ShopNotFound() {
    return (
        <div className="flex flex-col items-center justify-center py-20 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Search className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="text-xl font-bold text-gray-900">Page not found</h2>
            <p className="mt-2 text-sm text-gray-500">We couldn&apos;t find what you&apos;re looking for</p>
            <div className="mt-6 flex gap-3">
                <Link
                    href="/"
                    className="inline-flex h-10 items-center rounded-xl bg-green-500 px-6 text-sm font-semibold text-white hover:bg-green-600"
                >
                    Home
                </Link>
                <Link
                    href="/products"
                    className="inline-flex h-10 items-center rounded-xl border border-gray-200 px-6 text-sm font-semibold text-gray-700 hover:bg-gray-50"
                >
                    Browse Products
                </Link>
            </div>
        </div>
    )
}
