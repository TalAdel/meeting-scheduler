import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

/**
 * cn - Class Name utility function
 * 
 * WHY? This function combines clsx and tailwind-merge to:
 * 1. Handle conditional classes (clsx)
 * 2. Intelligently merge Tailwind classes (twMerge)
 * 
 * EXAMPLE:
 * cn('px-2 py-1', condition && 'bg-blue-500', { 'text-white': isActive })
 * 
 * The Logic Behind:
 * - clsx: Handles conditional logic and combines class names
 * - twMerge: Resolves Tailwind class conflicts (e.g., 'p-2 p-4' becomes 'p-4')
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

/**
 * formatDate - Formats ISO date string to readable format
 * 
 * WHY? Consistent date formatting across the app
 * 
 * EXAMPLE INPUT: "2024-12-30T10:00:00.000Z"
 * EXAMPLE OUTPUT: "Sat, Dec 30, 2024"
 */
export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

/**
 * formatTime - Formats ISO date string to readable time
 * 
 * WHY? Consistent time formatting across the app
 * 
 * EXAMPLE INPUT: "2024-12-30T10:30:00.000Z"
 * EXAMPLE OUTPUT: "10:30 AM"
 */
export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

/**
 * getStatusColor - Returns Tailwind classes for status badges
 * 
 * WHY? DRY principle - centralize status color logic
 * This ensures consistent styling for status badges across the app
 * 
 * The Logic Behind:
 * - Each status has specific colors for background, text, and border
 * - Using Tailwind utility classes for easy maintenance
 * - Follows a color-coded convention: green=good, red=bad, yellow=pending, blue=attended
 */
export function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'declined':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'attended':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default: // pending
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
}

