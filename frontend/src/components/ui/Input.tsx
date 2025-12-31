import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'

/**
 * Input Component
 * 
 * A reusable input component that provides:
 * - Consistent styling across the app
 * - Built-in label and error message support
 * - Optional icon support for better UX
*/

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {/* Label - improves accessibility and UX */}
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        
        <div className="relative">
          {/* Icon - provides visual context */}
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          
          {/* Input field */}
          <input
            ref={ref}
            className={cn(
              // Base styles
              'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm',
              'placeholder:text-gray-400',
              // Focus styles - provides clear feedback
              'focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent',
              // Disabled styles
              'disabled:cursor-not-allowed disabled:opacity-50',
              // Smooth transitions
              'transition-shadow',
              // Add left padding if icon exists
              icon && 'pl-10',
              // Error styles - red border when error exists
              error && 'border-red-500 focus:ring-red-500',
              className,
            )}
            {...props}
          />
        </div>
        
        {/* Error message - provides feedback on validation */}
        {error && (
          <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    )
  },
)

// DisplayName is important for debugging in React DevTools
Input.displayName = 'Input'

