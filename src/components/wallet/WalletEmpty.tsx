import Link from 'next/link'
import { Wallet } from 'lucide-react'

export function WalletEmpty() {
    return (
        <div className="flex flex-col items-center justify-center py-16 text-center">
            <div className="mb-4 flex h-20 w-20 items-center justify-center rounded-full bg-gray-100">
                <Wallet className="h-10 w-10 text-gray-300" strokeWidth={1.5} />
            </div>
            <h3 className="text-lg font-bold text-gray-900">No transactions yet</h3>
            <p className="mt-1 text-sm text-gray-500">Add money to start using your wallet</p>
            <Link
                href="/wallet/add-money"
                className="mt-5 inline-flex h-10 items-center rounded-xl bg-green-500 px-6 text-sm font-semibold text-white hover:bg-green-600"
            >
                Add Money
            </Link>
        </div>
    )
}
