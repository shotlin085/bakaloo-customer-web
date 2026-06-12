import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'
import dayjs from 'dayjs'
import relativeTime from 'dayjs/plugin/relativeTime'
import timezone from 'dayjs/plugin/timezone'
import utc from 'dayjs/plugin/utc'

dayjs.extend(relativeTime)
dayjs.extend(timezone)
dayjs.extend(utc)

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/** ₹1,24,500 Indian format */
export function formatINR(amount: number | string) {
  return new Intl.NumberFormat('en-IN', {
    style: 'currency',
    currency: 'INR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(Number(amount) || 0)
}

/** 22 May 2026, 3:45 PM */
export function formatDateTime(iso: string) {
  return dayjs.utc(iso).tz('Asia/Kolkata').format('DD MMM YYYY, h:mm A')
}

export function formatDate(iso: string) {
  return dayjs.utc(iso).tz('Asia/Kolkata').format('DD MMM YYYY')
}

export function timeAgo(iso: string) {
  return dayjs.utc(iso).tz('Asia/Kolkata').fromNow()
}

export function discountPercent(original: number | string, sale: number | string) {
  const o = Number(original) || 0
  const s = Number(sale) || 0
  if (o === 0) return 0
  return Math.round(((o - s) / o) * 100)
}

export function formatPhone(phone: string) {
  const digits = phone.replace(/\D/g, '')
  if (digits.length === 12) {
    return `+${digits.slice(0, 2)} ${digits.slice(2, 7)} ${digits.slice(7)}`
  }
  if (digits.length === 10) {
    return `${digits.slice(0, 5)} ${digits.slice(5)}`
  }
  return phone
}

export function truncate(text: string, length: number) {
  if (text.length <= length) return text
  return text.slice(0, length).trim() + '...'
}
