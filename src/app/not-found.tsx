import Link from 'next/link'

export default function NotFound() {
    return (
        <div className="flex min-h-screen flex-col items-center justify-center bg-[#F0EDE8] px-6 text-center">
            <h1 className="text-7xl font-bold text-gray-200">404</h1>
            <h2 className="mt-4 text-xl font-bold text-gray-900">Page not found</h2>
            <p className="mt-2 text-sm text-gray-500">
                The page you&apos;re looking for doesn&apos;t exist or has been moved.
            </p>
            <Link
                href="/"
                className="mt-6 inline-flex h-11 items-center rounded-xl bg-green-500 px-6 text-sm font-semibold text-white hover:bg-green-600"
            >
                Back to Home
            </Link>
        </div>
    )
}
