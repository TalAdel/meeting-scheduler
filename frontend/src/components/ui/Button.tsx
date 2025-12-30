import React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'

/**
 * Button Component
 * 
 * WHY? A reusable button component following SOLID principles:
 * - Single Responsibility: Only handles button rendering and styling
 * - Open/Closed: Open for extension (variants), closed for modification
 * 
 * The Logic Behind variants:
 * - primary: Main call-to-action buttons (e.g., "Sign In", "Create Meeting")
 * - secondary: Less prominent actions
 * - outline: Secondary actions that need clear boundaries
 * - ghost: Minimal styling for less important actions
 * - danger: Destructive actions (e.g., "Delete", "Sign Out")
 * 
 * The Logic Behind sizes:
 * - sm: Compact spaces, filters, inline actions
 * - md: Standard size for most buttons
 * - lg: Hero sections, primary CTAs
 * 
 * isLoading prop:
 * - Shows a spinner and disables the button during async operations
 * - Improves UX by giving visual feedback
 */

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger'
  size?: 'sm' | 'md' | 'lg'
  isLoading?: boolean
}

export function Button({
  className,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  children,
  disabled,
  ...props
}: ButtonProps) {
  // Variant styles - each serves a specific UX purpose
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  }

  // Size styles - consistent spacing across the app
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  }

  return (
    <button
      className={cn(
        // Base styles - applied to all buttons
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors',
        'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2',
        'disabled:opacity-50 disabled:pointer-events-none',
        // Dynamic styles based on props
        variants[variant],
        sizes[size],
        className,
      )}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
      {children}
    </button>
  )
}

