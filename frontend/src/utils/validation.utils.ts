/**
 * Validation Utilities
 * 
 * WHY separate file?
 * - Single Responsibility: Each function validates one thing
 * - DRY: Reusable across multiple components
 * - Testable: Easy to unit test
 * - Maintainable: Change validation rules in one place
 * 
 * SOLID Principles:
 * - Each function has ONE job
 * - Easy to extend with new validation rules
 * - No dependencies on React components
 */

/**
 * Profile Validation Result
 */
export interface ValidationResult {
  isValid: boolean
  error?: string
}

/**
 * Validates full name
 * 
 * Rules:
 * - Required (not empty)
 * - Min 2 characters
 * - Max 100 characters
 * - Only letters and spaces
 */
export function validateFullName(fullName: string): ValidationResult {
  const trimmed = fullName.trim()

  if (!trimmed || trimmed.length === 0) {
    return { isValid: false, error: 'Full name is required' }
  }

  if (trimmed.length < 2) {
    return { isValid: false, error: 'Full name must be at least 2 characters' }
  }

  if (trimmed.length > 100) {
    return { isValid: false, error: 'Full name must be less than 100 characters' }
  }

  // Only letters and spaces allowed
  if (!/^[a-zA-Z\s]+$/.test(trimmed)) {
    return { isValid: false, error: 'Full name can only contain letters and spaces' }
  }

  return { isValid: true }
}

/**
 * Validates password strength
 * 
 * Rules:
 * - Min 8 characters
 * - At least one number
 * - At least one special character
 * - At least one uppercase letter
 * - At least one lowercase letter
 */
export function validatePassword(password: string): ValidationResult {
  if (!password) {
    return { isValid: false, error: 'Password is required' }
  }

  if (password.length < 8) {
    return { isValid: false, error: 'Password must be at least 8 characters long' }
  }

  if (!/\d/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one number' }
  }

  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one special character (!@#$%^&*...)' }
  }

  if (!/[A-Z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one uppercase letter' }
  }

  if (!/[a-z]/.test(password)) {
    return { isValid: false, error: 'Password must contain at least one lowercase letter' }
  }

  return { isValid: true }
}

/**
 * Validates password change request
 * 
 * Checks:
 * - Current password provided
 * - New password meets strength requirements
 * - Passwords match
 * - New password is different from current
 */
export function validatePasswordChange(
  currentPassword: string,
  newPassword: string,
  confirmPassword: string
): ValidationResult {
  // Check current password
  if (!currentPassword) {
    return { isValid: false, error: 'Current password is required' }
  }

  // Validate new password strength
  const passwordValidation = validatePassword(newPassword)
  if (!passwordValidation.isValid) {
    return passwordValidation
  }

  // Check confirm password
  if (!confirmPassword) {
    return { isValid: false, error: 'Please confirm your new password' }
  }

  // Check passwords match
  if (newPassword !== confirmPassword) {
    return { isValid: false, error: 'New passwords do not match' }
  }

  // Check new password is different
  if (currentPassword === newPassword) {
    return { isValid: false, error: 'New password must be different from current password' }
  }

  return { isValid: true }
}

/**
 * Validates profile update data
 * 
 * Checks what fields changed and validates them
 */
export function validateProfileUpdate(
  formData: { fullName: string; title?: string; bio?: string },
  currentData: { fullName?: string; title?: string; bio?: string }
): ValidationResult {
  // Validate full name
  const nameValidation = validateFullName(formData.fullName)
  if (!nameValidation.isValid) {
    return nameValidation
  }

  // Check if anything actually changed
  const hasChanges = 
    formData.fullName !== currentData.fullName ||
    formData.title !== currentData.title ||
    formData.bio !== currentData.bio

  if (!hasChanges) {
    return { isValid: false, error: 'No changes to save' }
  }

  return { isValid: true }
}

/**
 * Validates email format
 * Simple regex check for basic email format
 */
export function validateEmail(email: string): ValidationResult {
  if (!email) {
    return { isValid: false, error: 'Email is required' }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  if (!emailRegex.test(email)) {
    return { isValid: false, error: 'Invalid email format' }
  }

  return { isValid: true }
}

/**
 * Validates meeting title
 */
export function validateMeetingTitle(title: string): ValidationResult {
  const trimmed = title.trim()

  if (!trimmed) {
    return { isValid: false, error: 'Meeting title is required' }
  }

  if (trimmed.length < 3) {
    return { isValid: false, error: 'Title must be at least 3 characters' }
  }

  if (trimmed.length > 200) {
    return { isValid: false, error: 'Title must be less than 200 characters' }
  }

  return { isValid: true }
}

/**
 * Validates meeting time range
 */
export function validateMeetingTime(
  startTime: string,
  endTime: string
): ValidationResult {
  if (!startTime) {
    return { isValid: false, error: 'Start time is required' }
  }

  if (!endTime) {
    return { isValid: false, error: 'End time is required' }
  }

  const start = new Date(startTime)
  const end = new Date(endTime)

  // Check start time is not in the past
  const now = new Date()
  if (start < now) {
    return { isValid: false, error: 'Start time cannot be in the past' }
  }

  // Check end time is after start time
  if (end <= start) {
    return { isValid: false, error: 'End time must be after start time' }
  }

  // Check meeting duration (max 8 hours)
  const durationMs = end.getTime() - start.getTime()
  const durationHours = durationMs / (1000 * 60 * 60)
  
  if (durationHours > 8) {
    return { isValid: false, error: 'Meeting cannot be longer than 8 hours' }
  }

  return { isValid: true }
}

