export interface RazorpayOrder {
    paymentId: string
    razorpayOrderId: string
    amount: number
    currency: string
    keyId: string
}

export interface RazorpayPaymentResponse {
    razorpay_order_id: string
    razorpay_payment_id: string
    razorpay_signature: string
}

export interface PaymentVerifyPayload {
    razorpayOrderId: string
    razorpayPaymentId: string
    razorpaySignature: string
}

export interface PaymentHistory {
    id: string
    amount: number
    status: string
    method: string
    created_at: string
}
