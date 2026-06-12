import { ArrowDownLeft, ArrowUpRight } from 'lucide-react'
import { cn, formatDateTime, formatINR } from '@/lib/utils'

interface Transaction {
    id: string
    type: 'CREDIT' | 'DEBIT'
    amount: number
    description?: string
    balanceAfter?: number
    created_at?: string
    createdAt?: string
}

interface TransactionRowProps {
    transaction: Transaction
}

export function TransactionRow({ transaction }: TransactionRowProps) {
    const isCredit = transaction.type === 'CREDIT'
    const Icon = isCredit ? ArrowUpRight : ArrowDownLeft

    return (
        <div className="flex items-center gap-3 rounded-xl px-4 py-3 transition-colors hover:bg-gray-50">
            <div
                className={cn(
                    'flex h-10 w-10 shrink-0 items-center justify-center rounded-full',
                    isCredit ? 'bg-green-50' : 'bg-gray-100',
                )}
            >
                <Icon className={cn('h-5 w-5', isCredit ? 'text-green-500' : 'text-gray-400')} strokeWidth={1.5} />
            </div>

            <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-gray-900">
                    {transaction.description || (isCredit ? 'Money Added' : 'Payment')}
                </p>
                <p className="mt-0.5 text-xs text-gray-400">
                    {formatDateTime(transaction.created_at ?? transaction.createdAt ?? '')}
                </p>
            </div>

            <div className="text-right">
                <p className={cn('text-sm font-bold', isCredit ? 'text-green-600' : 'text-gray-600')}>
                    {isCredit ? '+' : '-'}
                    {formatINR(transaction.amount)}
                </p>
                {transaction.balanceAfter !== undefined && (
                    <p className="mt-0.5 text-[10px] text-gray-400">
                        Bal: {formatINR(transaction.balanceAfter)}
                    </p>
                )}
            </div>
        </div>
    )
}
