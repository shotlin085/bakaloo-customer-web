import { z } from 'zod'

export const phoneSchema = z
    .string()
    .min(10, 'Enter 10-digit mobile number')
    .max(10, 'Enter 10-digit mobile number')
    .regex(/^[6-9]\d{9}$/, 'Enter valid Indian mobile number')

export const otpSchema = z
    .string()
    .length(6, 'OTP must be 6 digits')
    .regex(/^\d{6}$/, 'OTP must be 6 digits')

export const addressSchema = z.object({
    label: z.string().min(1, 'Select a label').default('Home'),
    addressLine1: z.string().min(5, 'Address is required'),
    addressLine2: z.string().optional().or(z.literal('')),
    landmark: z.string().optional().or(z.literal('')),
    city: z.string().min(2, 'City is required'),
    state: z.string().min(2, 'Select a state'),
    pincode: z
        .string()
        .length(6, 'Pincode must be 6 digits')
        .regex(/^[1-9]\d{5}$/, 'Enter valid 6-digit pincode'),
    isDefault: z.boolean().optional().default(false),
})

export const profileSchema = z.object({
    name: z.string().min(2, 'Name must be at least 2 characters').max(50),
    email: z.string().email('Enter valid email').optional().or(z.literal('')),
    birthday: z.string().optional(),
})

export const reviewSchema = z.object({
    rating: z.number().min(1, 'Please select a rating').max(5),
    comment: z.string().min(10, 'Review must be at least 10 characters').max(500),
})
