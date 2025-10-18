import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with spaces for better readability
 * Examples: 10000 -> "10 000", 100000 -> "100 000"
 */
export function formatNumberWithSpaces(value: string | number): string {
  const numValue = typeof value === 'string' ? parseFloat(value) : value
  
  if (isNaN(numValue)) {
    return value.toString()
  }
  
  // Convert to string and add spaces every 3 digits from the right
  return numValue.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
