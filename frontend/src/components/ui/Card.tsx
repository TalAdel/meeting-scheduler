import React from 'react'
import { cn } from '../../lib/utils'

/**
 * Card Component with sub-components
 * 
 * WHY? Following the Compound Component pattern:
 * - Provides flexible card structure
 * - Each sub-component handles its own styling
 * - Makes the code more maintainable and readable
 * 
 * The Logic Behind the structure:
 * - Card: Main container with border and shadow
 * - CardHeader: Top section for titles
 * - CardContent: Main content area
 * - CardFooter: Bottom section for actions
 * 
 * The hover prop:
 * - Adds interactive feedback for clickable cards
 * - Improves UX by signaling interactivity
 * 
 * EXAMPLE Usage:
 * <Card hover>
 *   <CardHeader>
 *     <h2>Meeting Title</h2>
 *   </CardHeader>
 *   <CardContent>
 *     <p>Meeting details...</p>
 *   </CardContent>
 *   <CardFooter>
 *     <Button>View Details</Button>
 *   </CardFooter>
 * </Card>
 */

interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  hover?: boolean
}

export function Card({
  className,
  hover = false,
  children,
  ...props
}: CardProps) {
  return (
    <div
      className={cn(
        // Base styles
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
        // Hover effect for interactive cards
        hover &&
          'transition-all duration-200 hover:shadow-md hover:border-indigo-200',
        className,
      )}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardHeader - Top section of the card
 * Usually contains titles and subtitles
 */
export function CardHeader({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 border-b border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

/**
 * CardContent - Main content area
 * Contains the primary card information
 */
export function CardContent({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div className={cn('p-6', className)} {...props}>
      {children}
    </div>
  )
}

/**
 * CardFooter - Bottom section for actions
 * Usually contains buttons or links
 */
export function CardFooter({
  className,
  children,
  ...props
}: React.HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={cn('px-6 py-4 bg-gray-50 border-t border-gray-100', className)}
      {...props}
    >
      {children}
    </div>
  )
}

