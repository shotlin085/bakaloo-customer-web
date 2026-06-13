'use client'

import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogFooter,
    DialogHeader,
    DialogTitle,
} from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { ShoppingCart, AlertTriangle } from 'lucide-react'

interface CartStoreSwitchDialogProps {
    open: boolean
    currentStoreName: string
    newStoreName: string
    onConfirm: () => void
    onCancel: () => void
}

/**
 * Confirmation dialog shown when a customer tries to add a product
 * from a different store than their current cart.
 *
 * Confirming clears the current cart and switches to the new store.
 * Cancelling leaves the cart unchanged.
 */
export function CartStoreSwitchDialog({
    open,
    currentStoreName,
    newStoreName,
    onConfirm,
    onCancel,
}: CartStoreSwitchDialogProps) {
    return (
        <Dialog open={open} onOpenChange={(v) => { if (!v) onCancel() }}>
            <DialogContent className="max-w-sm">
                <DialogHeader>
                    <div className="flex items-center gap-3 mb-1">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full bg-amber-50">
                            <AlertTriangle className="h-5 w-5 text-amber-500" />
                        </div>
                        <DialogTitle className="text-base">Switch store?</DialogTitle>
                    </div>
                    <DialogDescription className="text-sm text-gray-600 leading-relaxed">
                        Your cart has items from{' '}
                        <span className="font-semibold text-gray-900">{currentStoreName}</span>.
                        Switching to{' '}
                        <span className="font-semibold text-gray-900">{newStoreName}</span>{' '}
                        will clear your current cart.
                    </DialogDescription>
                </DialogHeader>

                <div className="my-1 flex items-start gap-2 rounded-lg border border-amber-100 bg-amber-50 px-3 py-2">
                    <ShoppingCart className="mt-0.5 h-4 w-4 shrink-0 text-amber-600" />
                    <p className="text-xs text-amber-800">
                        Items from <strong>{currentStoreName}</strong> will be removed from your cart.
                    </p>
                </div>

                <DialogFooter className="flex-col sm:flex-row gap-2 mt-2">
                    {/* Min 44×44px touch targets */}
                    <Button
                        variant="outline"
                        onClick={onCancel}
                        className="min-h-[44px] w-full sm:w-auto"
                    >
                        Keep current cart
                    </Button>
                    <Button
                        onClick={onConfirm}
                        className="min-h-[44px] w-full sm:w-auto bg-purple-600 hover:bg-purple-700"
                    >
                        Switch to {newStoreName}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    )
}
