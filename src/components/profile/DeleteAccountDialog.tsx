'use client'

import { useEffect, useState } from 'react'
import { useRouter } from 'next/navigation'
import { useMutation, useQueryClient } from '@tanstack/react-query'
import { AnimatePresence, motion } from 'framer-motion'
import { AlertTriangle, Loader2, X } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

interface DeleteAccountDialogProps {
    isOpen: boolean
    onClose: () => void
}

export function DeleteAccountDialog({ isOpen, onClose }: DeleteAccountDialogProps) {
    const [confirmation, setConfirmation] = useState('')
    const router = useRouter()
    const queryClient = useQueryClient()
    const logout = useAuthStore((state) => state.logout)

    useEffect(() => {
        if (!isOpen) setConfirmation('')
    }, [isOpen])

    const deleteMutation = useMutation({
        mutationFn: authService.deleteAccount,
        onSuccess: async () => {
            if (typeof window !== 'undefined') {
                localStorage.removeItem('accessToken')
                localStorage.removeItem('refreshToken')
                localStorage.removeItem('bakaloo-auth')
                sessionStorage.clear()
            }

            if (typeof document !== 'undefined') {
                document.cookie = 'accessToken=; path=/; max-age=0'
            }

            logout()
            queryClient.clear()
            onClose()
            router.replace('/login')
            toast.success('Account deleted')
        },
        onError: () => {
            toast.error('Could not delete account')
        },
    })

    const canDelete = confirmation === 'DELETE' && !deleteMutation.isPending

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    className="fixed inset-0 z-[320] bg-black/30 backdrop-blur-sm"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={deleteMutation.isPending ? undefined : onClose}
                >
                    <motion.div
                        className="mx-auto mt-[10vh] w-[calc(100%-2rem)] max-w-md rounded-2xl bg-white p-6 shadow-xl"
                        initial={{ opacity: 0, y: 20, scale: 0.96 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 20, scale: 0.96 }}
                        transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                        onClick={(event) => event.stopPropagation()}
                    >
                        <div className="mb-4 flex items-start justify-between gap-3">
                            <div className="flex items-center gap-3">
                                <div className="flex h-11 w-11 items-center justify-center rounded-full bg-red-100 text-red-600">
                                    <AlertTriangle className="h-5 w-5" strokeWidth={1.5} />
                                </div>
                                <div>
                                    <h3 className="text-lg font-bold text-gray-900">Delete Account</h3>
                                    <p className="mt-0.5 text-xs text-gray-500">
                                        This action is permanent. All your data will be deleted.
                                    </p>
                                </div>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 items-center justify-center rounded-full border border-gray-200 text-gray-500 transition-colors hover:bg-gray-50"
                                aria-label="Close delete account dialog"
                                disabled={deleteMutation.isPending}
                            >
                                <X className="h-4 w-4" strokeWidth={1.5} />
                            </button>
                        </div>

                        <label className="mb-2 block text-xs font-semibold uppercase tracking-wide text-gray-500">
                            Type DELETE to confirm
                        </label>
                        <input
                            value={confirmation}
                            onChange={(event) => setConfirmation(event.target.value)}
                            placeholder="DELETE"
                            className="h-12 w-full rounded-xl border border-gray-200 px-4 text-sm font-medium text-gray-900 outline-none transition-all focus:border-green-500 focus:ring-2 focus:ring-green-500/20"
                        />

                        <div className="mt-5 grid grid-cols-2 gap-2.5">
                            <button
                                type="button"
                                onClick={onClose}
                                className="h-12 rounded-xl border border-gray-200 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-50"
                                disabled={deleteMutation.isPending}
                            >
                                Cancel
                            </button>
                            <button
                                type="button"
                                onClick={() => deleteMutation.mutate()}
                                disabled={!canDelete}
                                className="inline-flex h-12 items-center justify-center rounded-xl bg-red-500 text-sm font-semibold text-white transition-colors hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                {deleteMutation.isPending ? (
                                    <Loader2 className="h-4 w-4 animate-spin" strokeWidth={1.5} />
                                ) : (
                                    'Delete Account'
                                )}
                            </button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    )
}
