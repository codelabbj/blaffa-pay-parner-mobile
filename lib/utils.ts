import { clsx, type ClassValue } from "clsx"
import { twMerge } from "tailwind-merge"

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * Format number with spaces for better readability while preserving leading zeros
 * Examples: 10000 -> "10 000", 100000 -> "100 000", "01000" -> "0 1000"
 */
export function formatNumberWithSpaces(value: string | number): string {
  const stringValue = value.toString()
  
  // If it's not a valid number string, return as is
  if (!/^\d+$/.test(stringValue)) {
    return stringValue
  }
  
  // Add spaces every 3 digits from the right, preserving leading zeros
  return stringValue.replace(/\B(?=(\d{3})+(?!\d))/g, ' ')
}
