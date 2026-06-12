'use client'

import { useState, type FormEvent } from 'react'
import { Loader2 } from 'lucide-react'
import { toast } from 'sonner'

interface EditProfileFormProps {
    name: string
    email: string
    onSave: (data: { name: string; email: string }) => Promise<void>
}

export function EditProfileForm({ name: initName, email: initEmail, onSave }: EditProfileFormProps) {
    const [name, setName] = useState(initName)
    const [email, setEmail] = useState(initEmail)
    const [saving, setSaving] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        if (!name.trim()) {
            toast.error('Name is required')
            return
        }

        setSaving(true)
        try {
            await onSave({ name: name.trim(), email: email.trim() })
            toast.success('Profile updated!')
        } catch {
            toast.error('Failed to update')
        } finally {
            setSaving(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Name *</label>
                <input
                    type="text"
                    value={name}
                    onChange={(event) => setName(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
            </div>

            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Email</label>
                <input
                    type="email"
                    value={email}
                    onChange={(event) => setEmail(event.target.value)}
                    className="w-full rounded-xl border border-gray-200 px-4 py-3 text-sm focus:border-green-500 focus:outline-none focus:ring-1 focus:ring-green-500"
                />
            </div>

            <button
                type="submit"
                disabled={!name.trim() || saving}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
                {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : 'Save Changes'}
            </button>
        </form>
    )
}
