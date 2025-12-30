import { cn, getStatusColor } from '../../lib/utils'

/**
 * StatusBadge Component
 * 
 * WHY? Provides consistent visual representation of meeting statuses
 * 
 * AttendingStatus types:
 * - 'pending': User hasn't responded yet (yellow)
 * - 'confirmed': User will attend (green)
 * - 'declined': User won't attend (red)
 * - 'attended': Meeting is over, user attended (blue)
 * 
 * The Logic Behind the colors:
 * - Green (confirmed/attended): Positive, success
 * - Red (declined): Negative, alert
 * - Yellow (pending): Warning, needs attention
 * - Blue (attended): Informational, completed
 * 
 * SOLID Principles:
 * - Single Responsibility: Only renders status badges
 * - Open/Closed: Accepts className for extension without modification
 */

type AttendingStatus = 'pending' | 'confirmed' | 'declined' | 'attended'

interface StatusBadgeProps {
  status: AttendingStatus
  className?: string
}

export function StatusBadge({ status, className }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium border capitalize',
        getStatusColor(status),
        className,
      )}
    >
      {status}
    </span>
  )
}

