declare global {
    interface Window {
        Razorpay: new (options: RazorpayOptions) => RazorpayInstance
    }
}

interface RazorpayOptions {
    key: string
    amount: number
    currency: string
    order_id: string
    name: string
    description: string
    image?: string
    prefill?: { contact?: string; name?: string; email?: string }
    theme?: { color?: string }
    handler: (response: RazorpaySuccessResponse) => void
    modal?: { ondismiss?: () => void }
}

interface RazorpayInstance {
    open: () => void
}

interface RazorpaySuccessResponse {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

export function loadRazorpay(): Promise<void> {
    return new Promise((resolve, reject) => {
        if (typeof window !== 'undefined' && window.Razorpay) {
            resolve()
            return
        }
        const script = document.createElement('script')
        script.src = 'https://checkout.razorpay.com/v1/checkout.js'
        script.onload = () => resolve()
        script.onerror = () => reject(new Error('Razorpay SDK failed to load'))
        document.head.appendChild(script)
    })
}

export function openRazorpayCheckout(config: {
    amount: number
    currency: string
    orderId: string
    keyId: string
    userPhone: string
    userName: string
    userEmail?: string
    name?: string
    description?: string
    onSuccess: (payment: RazorpaySuccessResponse) => Promise<void>
    onDismiss: () => void
}): Promise<void> {
    return new Promise((resolve, reject) => {
        try {
            const rzp = new window.Razorpay({
                key: config.keyId,
                amount: config.amount,
                currency: config.currency,
                order_id: config.orderId,
                name: config.name ?? 'Bakaloo',
                description: config.description ?? 'Order Payment',
                image: '/logo.png',
                prefill: {
                    contact: config.userPhone,
                    name: config.userName,
                    email: config.userEmail,
                },
                theme: { color: '#22C55E' },
                handler: async (response) => {
                    try {
                        await config.onSuccess(response)
                        resolve()
                    } catch (error) {
                        reject(error)
                    }
                },
                modal: {
                    ondismiss: () => {
                        config.onDismiss()
                        resolve()
                    },
                },
            })
            rzp.open()
        } catch (error) {
            reject(error)
        }
    })
}
