```App.tsx
import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider } from './contexts/AuthContext';
import { MeetingsProvider } from './contexts/MeetingsContext';
import { AuthLayout } from './components/layouts/AuthLayout';
import { LandingPage } from './pages/LandingPage';
import { SignInPage } from './pages/SignInPage';
import { SignUpPage } from './pages/SignUpPage';
import { HomePage } from './pages/HomePage';
import { AddMeetingPage } from './pages/AddMeetingPage';
import { MeetingDetailPage } from './pages/MeetingDetailPage';
import { ProfilePage } from './pages/ProfilePage';
import { HistoryPage } from './pages/HistoryPage';
export function App() {
  return <AuthProvider>
      <MeetingsProvider>
        <Router>
          <Routes>
            {/* Public Routes */}
            <Route path="/" element={<LandingPage />} />
            <Route path="/signin" element={<SignInPage />} />
            <Route path="/signup" element={<SignUpPage />} />

            {/* Protected Routes */}
            <Route element={<AuthLayout />}>
              <Route path="/home" element={<HomePage />} />
              <Route path="/meetings/new" element={<AddMeetingPage />} />
              <Route path="/meetings/:id" element={<MeetingDetailPage />} />
              <Route path="/profile" element={<ProfilePage />} />
              <Route path="/history" element={<HistoryPage />} />
            </Route>

            {/* Fallback */}
            <Route path="*" element={<Navigate to="/" replace />} />
          </Routes>
        </Router>
      </MeetingsProvider>
    </AuthProvider>;
}
```
```components/FilterBar.tsx
import React, { useEffect, useState, useRef } from 'react'
import { Button } from './ui/Button'
import { cn } from '../lib/utils'
import { Filter, ChevronDown, Calendar, User, X, Check } from 'lucide-react'
import { AttendingStatus } from '../types'
interface FilterBarProps {
  onFilterChange: (filters: FilterState) => void
}
export interface FilterState {
  statuses: AttendingStatus[]
  dateRange: 'all' | 'today' | 'week' | 'month' | 'custom'
  customDateRange?: {
    start: string
    end: string
  }
  myMeetingsOnly: boolean
}
export function FilterBar({ onFilterChange }: FilterBarProps) {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    dateRange: 'all',
    myMeetingsOnly: false,
  })
  const [showStatusDropdown, setShowStatusDropdown] = useState(false)
  const [showDateDropdown, setShowDateDropdown] = useState(false)
  const [tempStartDate, setTempStartDate] = useState('')
  const [tempEndDate, setTempEndDate] = useState('')
  const statusRef = useRef<HTMLDivElement>(null)
  const dateRef = useRef<HTMLDivElement>(null)
  const statusOptions: {
    value: AttendingStatus
    label: string
  }[] = [
    {
      value: 'confirmed',
      label: 'Confirmed',
    },
    {
      value: 'pending',
      label: 'Pending',
    },
    {
      value: 'declined',
      label: 'Declined',
    },
  ]
  const dateOptions = [
    {
      value: 'all',
      label: 'All Time',
    },
    {
      value: 'today',
      label: 'Today',
    },
    {
      value: 'week',
      label: 'This Week',
    },
    {
      value: 'month',
      label: 'This Month',
    },
    {
      value: 'custom',
      label: 'Custom Range',
    },
  ] as const
  // Close dropdowns when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        statusRef.current &&
        !statusRef.current.contains(event.target as Node)
      ) {
        setShowStatusDropdown(false)
      }
      if (dateRef.current && !dateRef.current.contains(event.target as Node)) {
        setShowDateDropdown(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => document.removeEventListener('mousedown', handleClickOutside)
  }, [])
  // Notify parent of filter changes
  useEffect(() => {
    onFilterChange(filters)
  }, [filters, onFilterChange])
  const toggleStatus = (status: AttendingStatus) => {
    setFilters((prev) => ({
      ...prev,
      statuses: prev.statuses.includes(status)
        ? prev.statuses.filter((s) => s !== status)
        : [...prev.statuses, status],
    }))
  }
  const setDateRange = (range: FilterState['dateRange']) => {
    if (range === 'custom') {
      // Initialize temp dates with current custom range or today
      const today = new Date().toISOString().split('T')[0]
      setTempStartDate(filters.customDateRange?.start || today)
      setTempEndDate(filters.customDateRange?.end || today)
      setFilters((prev) => ({
        ...prev,
        dateRange: 'custom',
      }))
    } else {
      setFilters((prev) => ({
        ...prev,
        dateRange: range,
        customDateRange: undefined,
      }))
      setShowDateDropdown(false)
    }
  }
  const applyCustomDateRange = () => {
    if (tempStartDate && tempEndDate) {
      setFilters((prev) => ({
        ...prev,
        dateRange: 'custom',
        customDateRange: {
          start: tempStartDate,
          end: tempEndDate,
        },
      }))
      setShowDateDropdown(false)
    }
  }
  const toggleMyMeetings = () => {
    setFilters((prev) => ({
      ...prev,
      myMeetingsOnly: !prev.myMeetingsOnly,
    }))
  }
  const clearFilters = () => {
    setFilters({
      statuses: [],
      dateRange: 'all',
      myMeetingsOnly: false,
    })
    setTempStartDate('')
    setTempEndDate('')
  }
  const hasActiveFilters =
    filters.statuses.length > 0 ||
    filters.dateRange !== 'all' ||
    filters.myMeetingsOnly
  const activeFilterCount =
    filters.statuses.length +
    (filters.dateRange !== 'all' ? 1 : 0) +
    (filters.myMeetingsOnly ? 1 : 0)
  const getDateRangeLabel = () => {
    if (filters.dateRange === 'custom' && filters.customDateRange) {
      const start = new Date(filters.customDateRange.start).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
      )
      const end = new Date(filters.customDateRange.end).toLocaleDateString(
        'en-US',
        {
          month: 'short',
          day: 'numeric',
        },
      )
      return `${start} - ${end}`
    }
    return (
      dateOptions.find((d) => d.value === filters.dateRange)?.label ||
      'All Time'
    )
  }
  return (
    <div className="bg-white border border-gray-200 rounded-xl p-4 shadow-sm">
      <div className="flex flex-wrap items-center gap-3">
        <div className="flex items-center gap-2 text-sm font-medium text-gray-700">
          <Filter className="w-4 h-4" />
          <span>Filters:</span>
        </div>

        {/* Status Filter */}
        <div className="relative" ref={statusRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowStatusDropdown(!showStatusDropdown)}
            className={cn(
              'relative',
              filters.statuses.length > 0 &&
                'border-indigo-300 bg-indigo-50 text-indigo-700',
            )}
          >
            Status
            {filters.statuses.length > 0 && (
              <span className="ml-1.5 px-1.5 py-0.5 bg-indigo-600 text-white text-xs rounded-full font-medium">
                {filters.statuses.length}
              </span>
            )}
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 ml-1.5 transition-transform',
                showStatusDropdown && 'rotate-180',
              )}
            />
          </Button>

          {showStatusDropdown && (
            <div className="absolute top-full left-0 mt-2 w-56 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Filter by Status
              </div>
              {statusOptions.map((option) => (
                <button
                  key={option.value}
                  onClick={() => toggleStatus(option.value)}
                  className="w-full flex items-center gap-3 px-4 py-2.5 hover:bg-gray-50 transition-colors"
                >
                  <div
                    className={cn(
                      'w-4 h-4 rounded border-2 flex items-center justify-center transition-colors',
                      filters.statuses.includes(option.value)
                        ? 'bg-indigo-600 border-indigo-600'
                        : 'border-gray-300',
                    )}
                  >
                    {filters.statuses.includes(option.value) && (
                      <Check className="w-3 h-3 text-white" />
                    )}
                  </div>
                  <span className="text-sm text-gray-700">{option.label}</span>
                </button>
              ))}
            </div>
          )}
        </div>

        {/* Date Range Filter */}
        <div className="relative" ref={dateRef}>
          <Button
            variant="outline"
            size="sm"
            onClick={() => setShowDateDropdown(!showDateDropdown)}
            className={cn(
              'max-w-[200px]',
              filters.dateRange !== 'all' &&
                'border-indigo-300 bg-indigo-50 text-indigo-700',
            )}
          >
            <Calendar className="w-3.5 h-3.5 mr-1.5 flex-shrink-0" />
            <span className="truncate">{getDateRangeLabel()}</span>
            <ChevronDown
              className={cn(
                'w-3.5 h-3.5 ml-1.5 flex-shrink-0 transition-transform',
                showDateDropdown && 'rotate-180',
              )}
            />
          </Button>

          {showDateDropdown && (
            <div className="absolute top-full left-0 mt-2 w-80 bg-white rounded-lg shadow-lg border border-gray-200 py-2 z-20 animate-in fade-in slide-in-from-top-2 duration-200">
              <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                Date Range
              </div>

              {/* Preset Options */}
              {dateOptions
                .filter((opt) => opt.value !== 'custom')
                .map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setDateRange(option.value)}
                    className={cn(
                      'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors',
                      filters.dateRange === option.value &&
                        'bg-indigo-50 text-indigo-700 font-medium',
                    )}
                  >
                    {option.label}
                    {filters.dateRange === option.value && (
                      <Check className="w-4 h-4 inline ml-2 text-indigo-600" />
                    )}
                  </button>
                ))}

              {/* Custom Range Section */}
              <div className="border-t border-gray-100 mt-2 pt-2">
                <button
                  onClick={() => setDateRange('custom')}
                  className={cn(
                    'w-full text-left px-4 py-2.5 text-sm hover:bg-gray-50 transition-colors font-medium',
                    filters.dateRange === 'custom' &&
                      'bg-indigo-50 text-indigo-700',
                  )}
                >
                  Custom Range
                  {filters.dateRange === 'custom' && (
                    <Check className="w-4 h-4 inline ml-2 text-indigo-600" />
                  )}
                </button>

                {filters.dateRange === 'custom' && (
                  <div className="px-4 py-3 space-y-3 bg-gray-50 border-t border-gray-100">
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        Start Date
                      </label>
                      <input
                        type="date"
                        value={tempStartDate}
                        onChange={(e) => setTempStartDate(e.target.value)}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-medium text-gray-700 mb-1.5">
                        End Date
                      </label>
                      <input
                        type="date"
                        value={tempEndDate}
                        onChange={(e) => setTempEndDate(e.target.value)}
                        min={tempStartDate}
                        className="w-full px-3 py-2 text-sm border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                      />
                    </div>
                    <Button
                      size="sm"
                      onClick={applyCustomDateRange}
                      disabled={!tempStartDate || !tempEndDate}
                      className="w-full"
                    >
                      Apply Date Range
                    </Button>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* My Meetings Toggle */}
        <Button
          variant={filters.myMeetingsOnly ? 'secondary' : 'outline'}
          size="sm"
          onClick={toggleMyMeetings}
          className={cn(
            filters.myMeetingsOnly &&
              'border-indigo-300 bg-indigo-100 text-indigo-700',
          )}
        >
          <User className="w-3.5 h-3.5 mr-1.5" />
          My Meetings
          {filters.myMeetingsOnly && <Check className="w-3.5 h-3.5 ml-1.5" />}
        </Button>

        {/* Clear Filters */}
        {hasActiveFilters && (
          <>
            <div className="h-6 w-px bg-gray-200" />
            <button
              onClick={clearFilters}
              className="text-sm text-gray-500 hover:text-gray-700 font-medium flex items-center gap-1.5 transition-colors"
            >
              <X className="w-3.5 h-3.5" />
              Clear all ({activeFilterCount})
            </button>
          </>
        )}
      </div>
    </div>
  )
}

```
```components/layouts/AuthLayout.tsx
import React, { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../contexts/AuthContext'
import { Sidebar } from '../Sidebar'
import { Menu } from 'lucide-react'
export function AuthLayout() {
  const { isAuthenticated } = useAuth()
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false)
  if (!isAuthenticated) {
    return <Navigate to="/signin" replace />
  }
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />

      {/* Mobile Header */}
      <div className="md:hidden bg-white border-b border-gray-200 p-4 flex items-center justify-between sticky top-0 z-20">
        <span className="font-bold text-lg text-gray-900">Scheduler</span>
        <button
          onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
          className="p-2 text-gray-600 hover:bg-gray-100 rounded-lg"
        >
          <Menu className="w-6 h-6" />
        </button>
      </div>

      {/* Mobile Menu Overlay */}
      {isMobileMenuOpen && (
        <div
          className="md:hidden fixed inset-0 z-40 bg-gray-800/50"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <div
            className="bg-white w-64 h-full shadow-xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Reusing sidebar content logic would be ideal here, but for simplicity in this demo we'll just show the desktop sidebar is hidden */}
            <div className="p-6">
              <p className="text-sm text-gray-500">
                Please use desktop for full sidebar experience or implement
                mobile drawer.
              </p>
            </div>
          </div>
        </div>
      )}

      <main className="md:ml-64 min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

```
```components/Sidebar.tsx
import React, { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import {
  Calendar,
  PlusCircle,
  User,
  History,
  LogOut,
  LayoutDashboard,
} from 'lucide-react'
import { cn } from '../lib/utils'
import { Modal } from './ui/Modal'
export function Sidebar() {
  const { user, logout } = useAuth()
  const navigate = useNavigate()
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false)
  const handleLogout = () => {
    logout()
    navigate('/')
    setShowLogoutConfirm(false)
  }
  const navItems = [
    {
      to: '/home',
      icon: LayoutDashboard,
      label: 'My Meetings',
    },
    {
      to: '/meetings/new',
      icon: PlusCircle,
      label: 'New Meeting',
    },
    {
      to: '/history',
      icon: History,
      label: 'History',
    },
    {
      to: '/profile',
      icon: User,
      label: 'Profile',
    },
  ]
  return (
    <>
      <aside className="w-64 bg-white border-r border-gray-200 h-screen flex flex-col fixed left-0 top-0 z-30 hidden md:flex">
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Scheduler</span>
          </div>
        </div>

        <div className="flex-1 py-6 px-4 space-y-1 overflow-y-auto">
          {navItems.map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-medium transition-colors',
                  isActive
                    ? 'bg-indigo-50 text-indigo-700'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900',
                )
              }
            >
              <item.icon className="w-5 h-5" />
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.name}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {user?.name.charAt(0)}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.name}
              </p>
              <p className="text-xs text-gray-500 truncate">{user?.email}</p>
            </div>
          </div>
          <button
            onClick={() => setShowLogoutConfirm(true)}
            className="flex items-center gap-3 w-full px-3 py-2 text-sm font-medium text-red-600 hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-5 h-5" />
            Sign Out
          </button>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutConfirm}
        onClose={() => setShowLogoutConfirm(false)}
        title="Sign Out"
        description="Are you sure you want to sign out?"
        confirmLabel="Sign Out"
        cancelLabel="Cancel"
        confirmVariant="danger"
        onConfirm={handleLogout}
      />
    </>
  )
}

```
```components/ui/Button.tsx
import React from 'react'
import { cn } from '../../lib/utils'
import { Loader2 } from 'lucide-react'
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
  const variants = {
    primary: 'bg-indigo-600 text-white hover:bg-indigo-700 shadow-sm',
    secondary: 'bg-indigo-100 text-indigo-900 hover:bg-indigo-200',
    outline: 'border border-gray-300 bg-white text-gray-700 hover:bg-gray-50',
    ghost: 'text-gray-600 hover:bg-gray-100 hover:text-gray-900',
    danger: 'bg-red-600 text-white hover:bg-red-700 shadow-sm',
  }
  const sizes = {
    sm: 'h-8 px-3 text-xs',
    md: 'h-10 px-4 py-2',
    lg: 'h-12 px-6 text-lg',
  }
  return (
    <button
      className={cn(
        'inline-flex items-center justify-center rounded-lg font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
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

```
```components/ui/Card.tsx
import React from 'react'
import { cn } from '../../lib/utils'
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
        'bg-white rounded-xl border border-gray-200 shadow-sm overflow-hidden',
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

```
```components/ui/Input.tsx
import React, { forwardRef } from 'react'
import { cn } from '../../lib/utils'
interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string
  error?: string
  icon?: React.ReactNode
}
export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, label, error, icon, ...props }, ref) => {
    return (
      <div className="w-full">
        {label && (
          <label className="block text-sm font-medium text-gray-700 mb-1.5">
            {label}
          </label>
        )}
        <div className="relative">
          {icon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
              {icon}
            </div>
          )}
          <input
            ref={ref}
            className={cn(
              'flex h-10 w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent disabled:cursor-not-allowed disabled:opacity-50 transition-shadow',
              icon && 'pl-10',
              error && 'border-red-500 focus:ring-red-500',
              className,
            )}
            {...props}
          />
        </div>
        {error && (
          <p className="mt-1 text-sm text-red-500 animate-in slide-in-from-top-1 fade-in duration-200">
            {error}
          </p>
        )}
      </div>
    )
  },
)
Input.displayName = 'Input'

```
```components/ui/Modal.tsx
import React, { useEffect } from 'react'
import { X } from 'lucide-react'
import { cn } from '../../lib/utils'
import { Button } from './Button'
interface ModalProps {
  isOpen: boolean
  onClose: () => void
  title: string
  description?: string
  children?: React.ReactNode
  confirmLabel?: string
  cancelLabel?: string
  onConfirm?: () => void
  confirmVariant?: 'primary' | 'danger'
  isLoading?: boolean
}
export function Modal({
  isOpen,
  onClose,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  onConfirm,
  confirmVariant = 'primary',
  isLoading = false,
}: ModalProps) {
  // Close on Escape key
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        onClose()
      }
    }
    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen, onClose])
  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden'
    } else {
      document.body.style.overflow = 'unset'
    }
    return () => {
      document.body.style.overflow = 'unset'
    }
  }, [isOpen])
  if (!isOpen) return null
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm animate-in fade-in duration-200"
        onClick={onClose}
      />

      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl max-w-md w-full animate-in zoom-in-95 fade-in duration-200">
        {/* Header */}
        <div className="flex items-start justify-between p-6 border-b border-gray-100">
          <div>
            <h2 className="text-xl font-bold text-gray-900">{title}</h2>
            {description && (
              <p className="mt-1 text-sm text-gray-600">{description}</p>
            )}
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors rounded-lg p-1 hover:bg-gray-100"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        {children && <div className="p-6">{children}</div>}

        {/* Footer */}
        {onConfirm && (
          <div className="flex items-center justify-end gap-3 p-6 border-t border-gray-100 bg-gray-50 rounded-b-xl">
            <Button variant="ghost" onClick={onClose} disabled={isLoading}>
              {cancelLabel}
            </Button>
            <Button
              variant={confirmVariant}
              onClick={onConfirm}
              isLoading={isLoading}
            >
              {confirmLabel}
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

```
```components/ui/StatusBadge.tsx
import React from 'react'
import { AttendingStatus } from '../../types'
import { cn, getStatusColor } from '../../lib/utils'
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

```
```contexts/AuthContext.tsx
import React, { useEffect, useState, createContext, useContext } from 'react'
import { User } from '../types'
import { MOCK_USER } from '../data/mockData'
interface AuthContextType {
  user: User | null
  isAuthenticated: boolean
  login: (email: string) => void
  logout: () => void
  updateUser: (data: Partial<User>) => void
}
const AuthContext = createContext<AuthContextType | undefined>(undefined)
export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null)
  // Simulate checking local storage on mount
  useEffect(() => {
    const storedUser = localStorage.getItem('scheduler_user')
    if (storedUser) {
      setUser(JSON.parse(storedUser))
    }
  }, [])
  const login = (email: string) => {
    // Mock login - in a real app this would verify credentials
    const newUser = {
      ...MOCK_USER,
      email,
    }
    setUser(newUser)
    localStorage.setItem('scheduler_user', JSON.stringify(newUser))
  }
  const logout = () => {
    setUser(null)
    localStorage.removeItem('scheduler_user')
  }
  const updateUser = (data: Partial<User>) => {
    if (user) {
      const updatedUser = {
        ...user,
        ...data,
      }
      setUser(updatedUser)
      localStorage.setItem('scheduler_user', JSON.stringify(updatedUser))
    }
  }
  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        login,
        logout,
        updateUser,
      }}
    >
      {children}
    </AuthContext.Provider>
  )
}
export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider')
  }
  return context
}

```
```contexts/MeetingsContext.tsx
import React, { useEffect, useState, createContext, useContext } from 'react'
import { Meeting, AttendingStatus } from '../types'
import { MOCK_MEETINGS } from '../data/mockData'
interface MeetingsContextType {
  meetings: Meeting[]
  updateMeetingStatus: (
    meetingId: string,
    participantEmail: string,
    status: AttendingStatus,
  ) => void
  addMeeting: (meeting: Meeting) => void
  updateMeeting: (meetingId: string, updates: Partial<Meeting>) => void
  deleteMeeting: (meetingId: string) => void
}
const MeetingsContext = createContext<MeetingsContextType | undefined>(
  undefined,
)
export function MeetingsProvider({ children }: { children: ReactNode }) {
  const [meetings, setMeetings] = useState<Meeting[]>(() => {
    // Try to load from localStorage first
    const stored = localStorage.getItem('scheduler_meetings')
    return stored ? JSON.parse(stored) : MOCK_MEETINGS
  })
  // Persist to localStorage whenever meetings change
  useEffect(() => {
    localStorage.setItem('scheduler_meetings', JSON.stringify(meetings))
  }, [meetings])
  const updateMeetingStatus = (
    meetingId: string,
    participantEmail: string,
    status: AttendingStatus,
  ) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((meeting) => {
        if (meeting.id === meetingId) {
          return {
            ...meeting,
            participants: meeting.participants.map((p) =>
              p.email === participantEmail
                ? {
                    ...p,
                    status,
                  }
                : p,
            ),
          }
        }
        return meeting
      }),
    )
  }
  const addMeeting = (meeting: Meeting) => {
    setMeetings((prev) => [...prev, meeting])
  }
  const updateMeeting = (meetingId: string, updates: Partial<Meeting>) => {
    setMeetings((prevMeetings) =>
      prevMeetings.map((meeting) =>
        meeting.id === meetingId
          ? {
              ...meeting,
              ...updates,
            }
          : meeting,
      ),
    )
  }
  const deleteMeeting = (meetingId: string) => {
    setMeetings((prevMeetings) =>
      prevMeetings.filter((m) => m.id !== meetingId),
    )
  }
  return (
    <MeetingsContext.Provider
      value={{
        meetings,
        updateMeetingStatus,
        addMeeting,
        updateMeeting,
        deleteMeeting,
      }}
    >
      {children}
    </MeetingsContext.Provider>
  )
}
export function useMeetings() {
  const context = useContext(MeetingsContext)
  if (context === undefined) {
    throw new Error('useMeetings must be used within a MeetingsProvider')
  }
  return context
}

```
```data/mockData.ts
import { Meeting, User } from '../types'

export const MOCK_USER: User = {
  id: 'user-1',
  name: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  title: 'Product Manager',
  bio: 'Passionate about building great products and organizing effective meetings.',
  avatar:
    'https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?ixlib=rb-1.2.1&auto=format&fit=facearea&facepad=2&w=256&h=256&q=80',
}

export const MOCK_MEETINGS: Meeting[] = [
  {
    id: 'm-1',
    title: 'Q4 Product Roadmap Review',
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 90000000).toISOString(),
    location: 'Conference Room A',
    notes:
      'Reviewing the upcoming features for Q4. Please bring your status reports.',
    owner_id: 'user-1',
    participants: [
      { email: 'sarah@example.com', status: 'confirmed', name: 'Sarah Jones' },
      { email: 'mike@example.com', status: 'pending', name: 'Mike Chen' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-2',
    title: 'Design Sync',
    start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end_time: new Date(Date.now() + 176400000).toISOString(),
    location: 'Virtual (Zoom)',
    notes: 'Weekly design sync to discuss the new dashboard layout.',
    owner_id: 'user-1',
    participants: [
      { email: 'jessica@example.com', status: 'confirmed', name: 'Jessica Wu' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-3',
    title: 'Client Kickoff - Acme Corp',
    start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday (History)
    end_time: new Date(Date.now() - 82800000).toISOString(),
    location: '123 Business Rd, Tech City',
    notes: 'Initial kickoff meeting with the new client.',
    owner_id: 'user-1',
    participants: [
      { email: 'client@acme.com', status: 'attended', name: 'John Doe' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

```
```index.css
/* URL IMPORTS (SUCH AS FONT IMPORTS) SHOULD BE KEPT ABOVE TAILWIND IMPORTS - DO NOT DELETE THIS COMMENT */

/* PLEASE NOTE: THESE TAILWIND IMPORTS SHOULD NEVER BE DELETED - DO NOT DELETE THIS COMMENT */
@import 'tailwindcss/base';
@import 'tailwindcss/components';
@import 'tailwindcss/utilities';
/* DO NOT DELETE THESE TAILWIND IMPORTS, OTHERWISE THE STYLING WILL NOT RENDER AT ALL - DO NOT DELETE THIS COMMENT */
```
```index.tsx
import './index.css'
import React from "react";
import { render } from "react-dom";
import { App } from "./App";

render(<App />, document.getElementById("root"));

```
```lib/utils.ts
import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

export function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString('en-US', {
    weekday: 'short',
    month: 'short',
    day: 'numeric',
    year: 'numeric',
  })
}

export function formatTime(dateString: string) {
  return new Date(dateString).toLocaleTimeString('en-US', {
    hour: 'numeric',
    minute: '2-digit',
  })
}

export function getStatusColor(status: string) {
  switch (status) {
    case 'confirmed':
      return 'bg-green-100 text-green-700 border-green-200'
    case 'declined':
      return 'bg-red-100 text-red-700 border-red-200'
    case 'attended':
      return 'bg-blue-100 text-blue-700 border-blue-200'
    default:
      return 'bg-yellow-100 text-yellow-700 border-yellow-200'
  }
}

```
```pages/AddMeetingPage.tsx
import React, { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Participant } from '../types'
import {
  Plus,
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  UserPlus,
} from 'lucide-react'
export function AddMeetingPage() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipantEmail, setNewParticipantEmail] = useState('')
  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      newParticipantEmail &&
      !participants.find((p) => p.email === newParticipantEmail)
    ) {
      setParticipants([
        ...participants,
        {
          email: newParticipantEmail,
          status: 'pending',
        },
      ])
      setNewParticipantEmail('')
    }
  }
  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p.email !== email))
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      navigate('/home')
    }, 1000)
  }
  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Schedule New Meeting
        </h1>
        <p className="text-gray-600 mt-1">
          Fill in the details to invite your team.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Meeting Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Meeting Title"
              placeholder="e.g., Q4 Roadmap Review"
              required
              maxLength={200}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Time"
                type="datetime-local"
                required
                icon={<Calendar className="w-4 h-4" />}
              />
              <Input
                label="End Time"
                type="datetime-local"
                required
                icon={<Clock className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Location"
              placeholder="e.g., Conference Room A or Zoom Link"
              required
              maxLength={255}
              icon={<MapPin className="w-4 h-4" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes / Agenda
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  placeholder="Add meeting agenda or notes..."
                />
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Participants
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  icon={<UserPlus className="w-4 h-4" />}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddParticipant(e)
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddParticipant}
                variant="secondary"
              >
                Add
              </Button>
            </div>

            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.email}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {p.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {p.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(p.email)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                No participants added yet.
              </div>
            )}
          </CardContent>
        </Card>

        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/home')}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" isLoading={isLoading}>
            Schedule Meeting
          </Button>
        </div>
      </form>
    </div>
  )
}

```
```pages/HistoryPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { useMeetings } from '../contexts/MeetingsContext'
import { Card, CardContent } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDate, formatTime } from '../lib/utils'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
export function HistoryPage() {
  const { meetings } = useMeetings()
  // Filter for past meetings
  const pastMeetings = meetings
    .filter((m) => new Date(m.start_time) < new Date())
    .sort(
      (a, b) =>
        new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
    )
  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meeting History</h1>
        <div className="text-sm text-gray-500">
          Total: {pastMeetings.length} meetings
        </div>
      </div>

      <div className="grid gap-4">
        {pastMeetings.length > 0 ? (
          pastMeetings.map((meeting) => (
            <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
              <Card
                hover
                className="group opacity-75 hover:opacity-100 transition-opacity"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-100 rounded-lg text-gray-500 border border-gray-200">
                      <span className="text-xs font-bold uppercase">
                        {new Date(meeting.start_time).toLocaleDateString(
                          'en-US',
                          {
                            month: 'short',
                          },
                        )}
                      </span>
                      <span className="text-xl font-bold">
                        {new Date(meeting.start_time).getDate()}
                      </span>
                    </div>
                    <div>
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(meeting.start_time)}
                        </span>
                        <span>•</span>
                        <StatusBadge status="attended" />
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No past meetings
              </h3>
              <p className="text-gray-500 mt-1">
                Your meeting history will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

```
```pages/HomePage.tsx
import React, { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMeetings } from '../contexts/MeetingsContext'
import { FilterBar, FilterState } from '../components/FilterBar'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Plus, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { formatDate, formatTime } from '../lib/utils'
export function HomePage() {
  const { user } = useAuth()
  const { meetings } = useMeetings()
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    dateRange: 'all',
    myMeetingsOnly: false,
  })
  // Filter and sort meetings
  const filteredMeetings = useMemo(() => {
    let filtered = meetings.filter((m) => new Date(m.start_time) > new Date())
    // Filter by status (check if user's status in participants matches)
    if (filters.statuses.length > 0 && user) {
      filtered = filtered.filter((meeting) => {
        const userParticipant = meeting.participants.find(
          (p) => p.email === user.email,
        )
        return (
          userParticipant && filters.statuses.includes(userParticipant.status)
        )
      })
    }
    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter((meeting) => {
        const meetingDate = new Date(meeting.start_time)
        switch (filters.dateRange) {
          case 'today':
            const tomorrow = new Date(today)
            tomorrow.setDate(tomorrow.getDate() + 1)
            return meetingDate >= today && meetingDate < tomorrow
          case 'week':
            const weekEnd = new Date(today)
            weekEnd.setDate(weekEnd.getDate() + 7)
            return meetingDate >= today && meetingDate < weekEnd
          case 'month':
            const monthEnd = new Date(today)
            monthEnd.setMonth(monthEnd.getMonth() + 1)
            return meetingDate >= today && meetingDate < monthEnd
          case 'custom':
            if (filters.customDateRange) {
              const startDate = new Date(filters.customDateRange.start)
              startDate.setHours(0, 0, 0, 0)
              const endDate = new Date(filters.customDateRange.end)
              endDate.setHours(23, 59, 59, 999)
              return meetingDate >= startDate && meetingDate <= endDate
            }
            return true
          default:
            return true
        }
      })
    }
    // Filter by ownership
    if (filters.myMeetingsOnly && user) {
      filtered = filtered.filter((meeting) => meeting.owner_id === user.id)
    }
    return filtered.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
  }, [meetings, filters, user])
  const nextMeeting = filteredMeetings[0]
  const otherMeetings = filteredMeetings.slice(1)
  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.name.split(' ')[0]}
          </h1>
          <p className="text-gray-600 mt-1">
            Here's what's happening with your schedule.
          </p>
        </div>
        <Link to="/meetings/new">
          <Button className="w-full md:w-auto">
            <Plus className="w-4 h-4 mr-2" />
            New Meeting
          </Button>
        </Link>
      </div>

      {/* Filter Bar */}
      <FilterBar onFilterChange={setFilters} />

      {/* Results Count */}
      {(filters.statuses.length > 0 ||
        filters.dateRange !== 'all' ||
        filters.myMeetingsOnly) && (
        <div className="text-sm text-gray-600">
          Showing{' '}
          <span className="font-semibold text-gray-900">
            {filteredMeetings.length}
          </span>{' '}
          {filteredMeetings.length === 1 ? 'meeting' : 'meetings'}
        </div>
      )}

      {/* Hero Section - Next Meeting */}
      {nextMeeting ? (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
            <div className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
            Up Next
          </h2>
          <Card className="border-l-4 border-l-indigo-600 shadow-md">
            <CardContent className="p-6 md:p-8">
              <div className="flex flex-col md:flex-row justify-between gap-6">
                <div className="space-y-4 flex-1">
                  <div>
                    <StatusBadge status="confirmed" className="mb-3" />
                    <h3 className="text-2xl font-bold text-gray-900">
                      {nextMeeting.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span>{formatDate(nextMeeting.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <span>
                        {formatTime(nextMeeting.start_time)} -{' '}
                        {formatTime(nextMeeting.end_time)}
                      </span>
                    </div>
                    <div className="flex items-center gap-2 sm:col-span-2">
                      <MapPin className="w-5 h-5 text-indigo-500" />
                      <span>{nextMeeting.location}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-end">
                  <Link
                    to={`/meetings/${nextMeeting.id}`}
                    className="w-full md:w-auto"
                  >
                    <Button size="lg" className="w-full">
                      View Details
                    </Button>
                  </Link>
                </div>
              </div>
            </CardContent>
          </Card>
        </section>
      ) : (
        <Card className="bg-gray-50 border-dashed">
          <CardContent className="flex flex-col items-center justify-center py-12 text-center">
            <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
              <Calendar className="w-6 h-6 text-gray-500" />
            </div>
            <h3 className="text-lg font-medium text-gray-900">
              {filters.statuses.length > 0 ||
              filters.dateRange !== 'all' ||
              filters.myMeetingsOnly
                ? 'No meetings match your filters'
                : 'No upcoming meetings'}
            </h3>
            <p className="text-gray-500 mt-1 mb-6">
              {filters.statuses.length > 0 ||
              filters.dateRange !== 'all' ||
              filters.myMeetingsOnly
                ? 'Try adjusting your filters to see more results.'
                : "You're all caught up! Schedule a new meeting to get started."}
            </p>
            <Link to="/meetings/new">
              <Button variant="outline">Schedule Meeting</Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Upcoming List */}
      {otherMeetings.length > 0 && (
        <section>
          <h2 className="text-lg font-semibold text-gray-900 mb-4">
            Upcoming Meetings
          </h2>
          <div className="grid gap-4">
            {otherMeetings.map((meeting) => (
              <Link key={meeting.id} to={`/meetings/${meeting.id}`}>
                <Card hover className="group">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-100">
                        <span className="text-xs font-bold uppercase">
                          {new Date(meeting.start_time).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                            },
                          )}
                        </span>
                        <span className="text-xl font-bold">
                          {new Date(meeting.start_time).getDate()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(meeting.start_time)}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">
                            {meeting.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex -space-x-2">
                        {meeting.participants.slice(0, 3).map((p, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                          >
                            {p.name ? p.name.charAt(0) : p.email.charAt(0)}
                          </div>
                        ))}
                        {meeting.participants.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +{meeting.participants.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            ))}
          </div>
        </section>
      )}
    </div>
  )
}

```
```pages/LandingPage.tsx
import React from 'react'
import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Calendar, Check, Clock, Users } from 'lucide-react'
export function LandingPage() {
  return (
    <div className="min-h-screen bg-white">
      {/* Navbar */}
      <nav className="border-b border-gray-100">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Scheduler</span>
          </div>
          <div className="flex items-center gap-4">
            <Link to="/signin">
              <Button variant="ghost">Sign In</Button>
            </Link>
            <Link to="/signup">
              <Button>Get Started</Button>
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <div className="relative overflow-hidden pt-16 pb-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
          <div className="text-center max-w-3xl mx-auto">
            <h1 className="text-5xl md:text-6xl font-bold text-gray-900 tracking-tight mb-6">
              Master your time, <br />
              <span className="text-indigo-600">master your meetings</span>
            </h1>
            <p className="text-xl text-gray-600 mb-10 leading-relaxed">
              The professional way to schedule, manage, and track your meetings.
              Collaborate with your team and never miss a beat.
            </p>
            <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
              <Link to="/signup" className="w-full sm:w-auto">
                <Button size="lg" className="w-full sm:w-auto text-lg px-8">
                  Start for free
                </Button>
              </Link>
              <Link to="/signin" className="w-full sm:w-auto">
                <Button
                  variant="outline"
                  size="lg"
                  className="w-full sm:w-auto text-lg px-8"
                >
                  Sign In
                </Button>
              </Link>
            </div>
          </div>
        </div>

        {/* Decorative background elements */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-full h-full z-0 pointer-events-none opacity-30">
          <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob"></div>
          <div className="absolute top-20 right-10 w-72 h-72 bg-purple-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-2000"></div>
          <div className="absolute -bottom-8 left-1/2 w-72 h-72 bg-pink-300 rounded-full mix-blend-multiply filter blur-3xl animate-blob animation-delay-4000"></div>
        </div>
      </div>

      {/* Features Grid */}
      <div className="bg-gray-50 py-24">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-12">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Clock className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Smart Scheduling
              </h3>
              <p className="text-gray-600">
                Effortlessly schedule meetings with smart conflict detection and
                timezone management.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Users className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Team Collaboration
              </h3>
              <p className="text-gray-600">
                Invite participants, track attendance status, and share meeting
                notes in real-time.
              </p>
            </div>
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100">
              <div className="w-12 h-12 bg-indigo-100 rounded-xl flex items-center justify-center mb-6">
                <Check className="w-6 h-6 text-indigo-600" />
              </div>
              <h3 className="text-xl font-bold text-gray-900 mb-3">
                Meeting History
              </h3>
              <p className="text-gray-600">
                Keep a complete record of all past meetings, outcomes, and
                participant lists.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

```
```pages/MeetingDetailPage.tsx
import React, { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { useMeetings } from '../contexts/MeetingsContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDate, formatTime, cn } from '../lib/utils'
import {
  Calendar,
  Clock,
  MapPin,
  ArrowLeft,
  CheckCircle,
  XCircle,
  HelpCircle,
  ChevronDown,
} from 'lucide-react'
import { AttendingStatus } from '../types'
export function MeetingDetailPage() {
  const { id } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  const { meetings, updateMeetingStatus } = useMeetings()
  const meeting = meetings.find((m) => m.id === id)
  const [userStatus, setUserStatus] = useState<AttendingStatus>('pending')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  // Initialize user status from meeting data
  useEffect(() => {
    if (meeting && user) {
      const participant = meeting.participants.find(
        (p) => p.email === user.email,
      )
      if (participant) {
        setUserStatus(participant.status)
      }
    }
  }, [meeting, user])
  const handleStatusChange = (status: AttendingStatus) => {
    if (meeting && user) {
      setUserStatus(status)
      updateMeetingStatus(meeting.id, user.email, status)
      setIsDropdownOpen(false)
    }
  }
  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsDropdownOpen(false)
      }
    }
    document.addEventListener('mousedown', handleClickOutside)
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [])
  if (!meeting) {
    return (
      <div className="max-w-4xl mx-auto text-center py-12">
        <h2 className="text-2xl font-bold text-gray-900 mb-2">
          Meeting not found
        </h2>
        <p className="text-gray-600 mb-6">
          The meeting you're looking for doesn't exist.
        </p>
        <Button onClick={() => navigate('/home')}>Back to Home</Button>
      </div>
    )
  }
  const getStatusIcon = (status: AttendingStatus) => {
    switch (status) {
      case 'confirmed':
        return <CheckCircle className="w-4 h-4 text-green-600" />
      case 'declined':
        return <XCircle className="w-4 h-4 text-red-600" />
      case 'pending':
        return <HelpCircle className="w-4 h-4 text-yellow-600" />
      default:
        return null
    }
  }
  const getStatusLabel = (status: AttendingStatus) => {
    switch (status) {
      case 'confirmed':
        return 'Attending'
      case 'declined':
        return 'Declined'
      case 'pending':
        return 'Pending'
      default:
        return status
    }
  }
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Button
        variant="ghost"
        className="pl-0 hover:bg-transparent hover:text-indigo-600"
        onClick={() => navigate('/home')}
      >
        <ArrowLeft className="w-4 h-4 mr-2" />
        Back to Meetings
      </Button>

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {meeting.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{formatDate(meeting.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>
                {formatTime(meeting.start_time)} -{' '}
                {formatTime(meeting.end_time)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Actions */}
        <div
          className="flex items-center gap-2 bg-white p-2 rounded-lg shadow-sm border border-gray-200 relative"
          ref={dropdownRef}
        >
          {userStatus === 'pending' ? (
            <>
              <Button
                variant="primary"
                size="sm"
                onClick={() => handleStatusChange('confirmed')}
                className="bg-green-600 hover:bg-green-700"
              >
                Accept
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => handleStatusChange('declined')}
                className="text-red-600 hover:bg-red-50 border-red-200"
              >
                Decline
              </Button>
            </>
          ) : (
            <div className="relative">
              <div className="flex items-center gap-2">
                <div
                  className={cn(
                    'flex items-center gap-2 px-3 py-1.5 rounded-md font-medium text-sm border',
                    userStatus === 'confirmed'
                      ? 'bg-green-50 text-green-700 border-green-200'
                      : userStatus === 'declined'
                        ? 'bg-red-50 text-red-700 border-red-200'
                        : 'bg-yellow-50 text-yellow-700 border-yellow-200',
                  )}
                >
                  {getStatusIcon(userStatus)}
                  {getStatusLabel(userStatus)}
                </div>
                <Button
                  variant="ghost"
                  size="sm"
                  className="h-9 w-9 p-0 rounded-full hover:bg-gray-100"
                  onClick={() => setIsDropdownOpen(!isDropdownOpen)}
                >
                  <ChevronDown
                    className={cn(
                      'w-4 h-4 transition-transform',
                      isDropdownOpen && 'rotate-180',
                    )}
                  />
                </Button>
              </div>

              {/* Dropdown Menu */}
              {isDropdownOpen && (
                <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-lg shadow-lg border border-gray-100 py-1 z-10 animate-in fade-in slide-in-from-top-2 duration-200">
                  <div className="px-3 py-2 text-xs font-semibold text-gray-500 uppercase tracking-wider">
                    Change Status
                  </div>

                  <button
                    onClick={() => handleStatusChange('confirmed')}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors',
                      userStatus === 'confirmed'
                        ? 'text-green-700 bg-green-50/50'
                        : 'text-gray-700',
                    )}
                  >
                    <CheckCircle className="w-4 h-4" />
                    Attending
                    {userStatus === 'confirmed' && (
                      <span className="ml-auto text-green-600 text-xs font-medium">
                        Current
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleStatusChange('pending')}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors',
                      userStatus === 'pending'
                        ? 'text-yellow-700 bg-yellow-50/50'
                        : 'text-gray-700',
                    )}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Maybe
                    {userStatus === 'pending' && (
                      <span className="ml-auto text-yellow-600 text-xs font-medium">
                        Current
                      </span>
                    )}
                  </button>

                  <button
                    onClick={() => handleStatusChange('declined')}
                    className={cn(
                      'w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors',
                      userStatus === 'declined'
                        ? 'text-red-700 bg-red-50/50'
                        : 'text-gray-700',
                    )}
                  >
                    <XCircle className="w-4 h-4" />
                    Declined
                    {userStatus === 'declined' && (
                      <span className="ml-auto text-red-600 text-xs font-medium">
                        Current
                      </span>
                    )}
                  </button>
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {/* Main Content */}
        <div className="md:col-span-2 space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Details</h2>
            </CardHeader>
            <CardContent className="space-y-6">
              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Location
                </h3>
                <div className="flex items-center gap-2 text-gray-900 mb-4">
                  <MapPin className="w-5 h-5 text-gray-400" />
                  {meeting.location}
                </div>
                {/* Google Maps Embed Placeholder */}
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 relative">
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    scrolling="no"
                    marginHeight={0}
                    marginWidth={0}
                    src="https://maps.google.com/maps?width=100%25&amp;height=600&amp;hl=en&amp;q=1%20Grafton%20Street,%20Dublin,%20Ireland+(My%20Business%20Name)&amp;t=&amp;z=14&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
                    className="opacity-80 hover:opacity-100 transition-opacity"
                  ></iframe>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                  Notes
                </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {meeting.notes}
                </p>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Participants
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {meeting.participants.map((p, i) => (
                  <div key={i} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {p.name ? p.name.charAt(0) : p.email.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {p.name || p.email.split('@')[0]}
                        </span>
                        <span className="text-xs text-gray-500">{p.email}</span>
                      </div>
                    </div>
                    <StatusBadge status={p.status} />
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">Organizer</h2>
            </CardHeader>
            <CardContent>
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                  AM
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-900">
                    Alex Morgan
                  </p>
                  <p className="text-xs text-gray-500">
                    alex.morgan@example.com
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}

```
```pages/ProfilePage.tsx
import React, { useState } from 'react'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import {
  User,
  Mail,
  Briefcase,
  FileText,
  CheckCircle,
  Edit2,
  X,
} from 'lucide-react'
export function ProfilePage() {
  const { user, updateUser } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    name: user?.name || '',
    email: user?.email || '',
    title: user?.title || '',
    bio: user?.bio || '',
  })
  const handleEdit = () => {
    // Reset form data to current user data when entering edit mode
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      title: user?.title || '',
      bio: user?.bio || '',
    })
    setIsEditing(true)
  }
  const handleCancel = () => {
    // Reset form data and exit edit mode
    setFormData({
      name: user?.name || '',
      email: user?.email || '',
      title: user?.title || '',
      bio: user?.bio || '',
    })
    setIsEditing(false)
  }
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowSuccess(false)
    // Simulate API call
    setTimeout(() => {
      updateUser(formData)
      setIsLoading(false)
      setIsEditing(false)
      setShowSuccess(true)
      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1000)
  }
  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Profile updated successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.name}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md">
                    {user?.name.charAt(0)}
                  </div>
                )}
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {user?.name}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
              </div>
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {user?.name || 'Not set'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{user?.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Job Title
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {user?.title || 'Not set'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Bio
                  </label>
                  <div className="flex items-start gap-2 text-gray-900">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="font-medium whitespace-pre-wrap leading-relaxed">
                      {user?.bio || 'No bio added yet'}
                    </p>
                  </div>
                </div>
              </div> /* Edit Mode */
            ) : (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={formData.name}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        name: e.target.value,
                      })
                    }
                    icon={<User className="w-4 h-4" />}
                  />
                  <Input
                    label="Email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                    icon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <Input
                  label="Job Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Product Manager"
                  icon={<Briefcase className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bio
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bio: e.target.value,
                        })
                      }
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Only show in edit mode */}
            {isEditing && (
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

```
```pages/SignInPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Calendar, Mail, Lock } from 'lucide-react'
export function SignInPage() {
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      login(email)
      setIsLoading(false)
      navigate('/home')
    }, 1000)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">Sign in to access your meetings</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Sign In
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign up
          </Link>
        </div>
      </div>
    </div>
  )
}

```
```pages/SignUpPage.tsx
import React, { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../contexts/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Calendar, Mail, Lock, User } from 'lucide-react'
export function SignUpPage() {
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    // Simulate API call
    setTimeout(() => {
      login(email)
      setIsLoading(false)
      navigate('/home')
    }, 1000)
  }
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">
            Create an account
          </h1>
          <p className="text-gray-600 mt-2">
            Start managing your meetings today
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          <Button
            type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
          >
            Create Account
          </Button>
        </form>

        <div className="mt-6 text-center text-sm text-gray-600">
          Already have an account?{' '}
          <Link
            to="/signin"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign in
          </Link>
        </div>
      </div>
    </div>
  )
}

```
```tailwind.config.js
export default {}
```
```types/index.ts
export type AttendingStatus = 'pending' | 'confirmed' | 'declined' | 'attended'

export interface User {
  id: string
  name: string
  email: string
  avatar?: string
  title?: string
  bio?: string
}

export interface Participant {
  email: string
  status: AttendingStatus
  name?: string // Optional, often just email initially
}

export interface Meeting {
  id: string
  title: string
  start_time: string // ISO string
  end_time: string // ISO string
  location: string
  notes?: string
  owner_id: string
  participants: Participant[]
  created_at: string
  updated_at: string
}

```