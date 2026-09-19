import { type ClassValue, clsx } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(date: Date): string {
  return new Intl.DateTimeFormat('en-IN', {
    day: 'numeric',
    month: 'short',
    year: 'numeric',
  }).format(date)
}

export function generateCompanyId(index: number): string {
  const prefix = 'KIKTK'
  const paddedIndex = String(index + 1).padStart(6, '0')
  return `${prefix}${paddedIndex}`
}
