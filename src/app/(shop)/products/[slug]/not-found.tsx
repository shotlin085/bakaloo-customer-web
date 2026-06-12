import Link from 'next/link'
import { Package } from 'lucide-react'

export default function ProductNotFound() {
    return (
        <div className="flex flex-col items-center justify-center px-6 py-24">
            <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Package className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
            </div>
            <h2 className="mb-2 text-xl font-bold text-gray-900">Product not found</h2>
            <p className="mb-5 max-w-[280px] text-center text-sm text-gray-500">
                This product may have been removed or is temporarily unavailable.
            </p>
            <Link
                href="/products"
                className="flex h-10 items-center rounded-lg bg-green-500 px-6 text-sm font-semibold text-white transition-colors hover:bg-green-600"
            >
                Browse Products
            </Link>
        </div>
    )
}
