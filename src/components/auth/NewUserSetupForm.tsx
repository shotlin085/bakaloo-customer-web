'use client'

import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface NewUserSetupFormProps {
    onSubmit: (data: { name: string; email?: string }) => Promise<void>
}

export function NewUserSetupForm({ onSubmit }: NewUserSetupFormProps) {
    const [name, setName] = useState('')
    const [email, setEmail] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!name.trim()) {
            toast.error('Name is required')
            return
        }

        setLoading(true)
        try {
            await onSubmit({ name: name.trim(), email: email.trim() || undefined })
        } catch {
            toast.error('Something went wrong')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Your Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    placeholder="Enter your name"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
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
                    placeholder="you@example.com"
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
            </div>

            <button
                type="submit"
                disabled={!name.trim() || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Continue →'}
            </button>
        </form>
    )
}
