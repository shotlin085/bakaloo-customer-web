import Image from 'next/image'
import { formatINR } from '@/lib/utils'

interface OrderItem {
    name: string
    quantity: number
    price: number
    image?: string
    thumbnail_url?: string
    unit?: string
}

interface OrderItemsListProps {
    items: OrderItem[]
}

export function OrderItemsList({ items }: OrderItemsListProps) {
    return (
        <div className="space-y-2">
            {items.map((item, i) => (
                <div key={i} className="flex items-center gap-3 rounded-xl bg-gray-50 p-3">
                    <div className="relative h-12 w-12 shrink-0 overflow-hidden rounded-lg bg-white">
                        <Image
                            src={item.image || item.thumbnail_url || '/placeholder-product.svg'}
                            alt={item.name}
                            fill
                            className="object-contain p-1"
                            sizes="48px"
                        />
                    </div>
                    <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                        <p className="text-xs text-gray-400">
                            {item.unit ? `${item.unit} × ` : '×'}
                            {item.quantity}
                        </p>
                    </div>
                    <p className="text-sm font-bold text-gray-900">{formatINR(item.price * item.quantity)}</p>
                </div>
            ))}
        </div>
    )
}
