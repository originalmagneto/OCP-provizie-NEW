import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export interface FormatCurrencyOptions {
  locale?: string
  currency?: string
  minimumFractionDigits?: number
  maximumFractionDigits?: number
  showCurrency?: boolean
}

export function formatCurrency(
  amount: number,
  {
    locale = 'en-US',
    currency = 'USD',
    minimumFractionDigits,
    maximumFractionDigits,
    showCurrency = true,
  }: FormatCurrencyOptions = {}
): string {
  const options: Intl.NumberFormatOptions = {
    minimumFractionDigits,
    maximumFractionDigits,
  }

  if (showCurrency) {
    options.style = 'currency'
    options.currency = currency
  }

  return new Intl.NumberFormat(locale, options).format(amount)
}

export function formatDate(date: Date | string): string {
  return new Date(date).toLocaleDateString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  })
}

export function formatDateTime(date: Date | string): string {
  return new Date(date).toLocaleString('en-US', {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  })
}

export function truncateText(text: string, maxLength: number): string {
  if (text.length <= maxLength) return text
  return `${text.substring(0, maxLength)}...`
}

export function getInitials(name: string): string {
  return name
    .split(' ')
    .map((word) => word[0])
    .join('')
    .toUpperCase()
    .substring(0, 2)
}

export function generateRandomId(prefix = 'id'): string {
  return `${prefix}-${Math.random().toString(36).substring(2, 11)}`
}

export function isObjectEmpty(obj: Record<string, unknown>): boolean {
  return Object.keys(obj).length === 0
}

export function debounce<T extends (...args: unknown[]) => unknown>(
  func: T,
  wait: number
): (...args: Parameters<T>) => void {
  let timeout: ReturnType<typeof setTimeout> | null = null

  return function executedFunction(...args: Parameters<T>) {
    const later = () => {
      clearTimeout(timeout!)
      func(...args)
    }

    if (timeout) clearTimeout(timeout)
    timeout = setTimeout(later, wait)
  }
}

export function throttle<T extends (...args: unknown[]) => unknown>(
  func: T,
  limit: number
): (...args: Parameters<T>) => void {
  let inThrottle = false
  
  return function executedFunction(...args: Parameters<T>) {
    if (!inThrottle) {
      func(...args)
      inThrottle = true
      setTimeout(() => {
        inThrottle = false
      }, limit)
    }
  }
}
