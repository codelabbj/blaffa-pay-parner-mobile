import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with spaces for better readability while preserving leading zeros
 * Examples: 10000 -> "10 000", 100000 -> "100 000", "01000" -> "0 1000"
 */
export function formatNumberWithSpaces(value: string | number | null | undefined): string {
  if (value === null || value === undefined) {
    return ""
  }

  const stringValue = value.toString()

  const parts = stringValue.split('.')

  if (/^-?\d+$/.test(parts[0])) {
    parts[0] = parts[0].replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
  }

  return parts.join('.')
}
