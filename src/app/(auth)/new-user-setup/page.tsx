'use client'

import { useEffect, useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, User } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'
import { useAuthStore } from '@/store/auth.store'

export default function NewUserSetupPage() {
    const router = useRouter()
    const { user, setUser } = useAuthStore()
    const [name, setName] = useState(user?.name ?? '')
    const [email, setEmail] = useState(user?.email ?? '')
    const [isSubmitting, setIsSubmitting] = useState(false)

    useEffect(() => {
        document.title = 'Complete Your Profile — Bakaloo'
    }, [])

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!name.trim()) {
            toast.error('Please enter your name')
            return
        }

        setIsSubmitting(true)
        try {
            const updated = await authService.updateProfile({
                name: name.trim(),
                email: email.trim() || undefined,
            })
            setUser(updated)
            toast.success('Welcome to Bakaloo! 🎉')
            router.push('/')
        } catch {
            toast.error('Something went wrong. Please try again.')
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-6">
            <div className="w-full max-w-sm space-y-6">
                <div className="text-center">
                    <div className="mx-auto mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--shop-seasonal-accent-wash)]">
                        <User className="h-8 w-8 text-[color:var(--shop-primary)]" strokeWidth={1.5} />
                    </div>
                    <h1 className="text-2xl font-bold text-gray-900">Welcome! 👋</h1>
                    <p className="mt-1 text-sm text-gray-500">Let&apos;s set up your profile</p>
                </div>

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Your Name *
                        </label>
                        <input
                            type="text"
                            value={name}
                            onChange={(event) => setName(event.target.value)}
                            placeholder="Enter your name"
                            className="w-full rounded-xl border border-[color:var(--shop-border)] px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[color:var(--shop-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--shop-primary)]"
                            autoFocus
                        />
                    </div>

                    <div>
                        <label className="mb-1.5 block text-sm font-medium text-gray-700">
                            Email <span className="text-gray-400">(optional)</span>
                        </label>
                        <input
                            type="email"
                            value={email}
                            onChange={(event) => setEmail(event.target.value)}
                            placeholder="yourname@example.com"
                            className="w-full rounded-xl border border-[color:var(--shop-border)] px-4 py-3 text-sm font-medium text-gray-900 placeholder:text-gray-400 focus:border-[color:var(--shop-primary)] focus:outline-none focus:ring-1 focus:ring-[color:var(--shop-primary)]"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={!name.trim() || isSubmitting}
                        className="flex h-12 w-full items-center justify-center gap-2 rounded-xl bg-[color:var(--shop-primary)] text-base font-semibold text-white transition-colors hover:bg-[color:var(--shop-primary-hover)] disabled:opacity-50"
                    >
                        {isSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Continue →'}
                    </button>
                </form>
            </div>
        </div>
    )
}
