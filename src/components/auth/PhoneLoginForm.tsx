'use client'

import { useState, type FormEvent } from 'react'
import { useRouter } from 'next/navigation'
import { Loader2, Phone } from 'lucide-react'
import { toast } from 'sonner'
import { authService } from '@/services/auth.service'

export function PhoneLoginForm() {
    const router = useRouter()
    const [phone, setPhone] = useState('')
    const [loading, setLoading] = useState(false)

    const handleSubmit = async (event: FormEvent) => {
        event.preventDefault()
        const cleaned = phone.replace(/\D/g, '')

        if (!/^[6-9]\d{9}$/.test(cleaned)) {
            toast.error('Enter a valid 10-digit Indian mobile number')
            return
        }

        setLoading(true)
        try {
            const formatted = `+91${cleaned}`
            await authService.sendOtp(formatted)
            router.push(`/otp?phone=${encodeURIComponent(formatted)}`)
        } catch {
            toast.error('Failed to send OTP. Try again.')
        } finally {
            setLoading(false)
        }
    }

    return (
        <form onSubmit={handleSubmit} className="space-y-4">
            <div>
                <label className="mb-1.5 block text-sm font-medium text-gray-700">Phone Number</label>
                <div className="flex items-center gap-2 rounded-xl border border-gray-200 px-4 py-3 focus-within:border-green-500 focus-within:ring-1 focus-within:ring-green-500">
                    <span className="text-sm font-medium text-gray-500">+91</span>
                    <input
                        type="tel"
                        value={phone}
                        onChange={(event) => setPhone(event.target.value.replace(/\D/g, '').slice(0, 10))}
                        placeholder="98765 43210"
                        className="flex-1 bg-transparent text-sm outline-none placeholder:text-gray-400"
                        maxLength={10}
                        autoFocus
                    />
                </div>
            </div>

            <button
                type="submit"
                disabled={phone.length !== 10 || loading}
                className="flex w-full items-center justify-center gap-2 rounded-xl bg-green-500 py-3.5 text-sm font-semibold text-white hover:bg-green-600 disabled:opacity-50"
            >
                {loading ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                ) : (
                    <>
                        <Phone className="h-4 w-4" />
                        Send OTP
                    </>
                )}
            </button>
        </form>
    )
}
