import { useState } from 'react'
import { NavLink, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
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

/**
 * Sidebar Component
 * 
 * WHY? Provides consistent navigation across all authenticated pages
 * 
 * The Logic Behind the UX:
 * 1. Fixed position keeps navigation always accessible
 * 2. Active state highlights current page
 * 3. Icons improve scannability
 * 4. User info at bottom provides context
 * 5. Logout confirmation prevents accidents
 * 
 * Navigation Structure:
 * - My Meetings (home): Dashboard view
 * - New Meeting: Quick action for creating meetings
 * - History: Past meetings
 * - Profile: User settings
 * 
 * SOLID Principles:
 * - Single Responsibility: Only handles sidebar navigation
 * - Dependency Inversion: Depends on useAuth abstraction
 */

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
      <aside className="w-64 bg-white border-r border-gray-200 h-screen flex-col fixed left-0 top-0 z-30 hidden md:flex">
        {/* Logo/Brand */}
        <div className="p-6 border-b border-gray-100">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 bg-indigo-600 rounded-lg flex items-center justify-center">
              <Calendar className="w-5 h-5 text-white" />
            </div>
            <span className="font-bold text-xl text-gray-900">Scheduler</span>
          </div>
        </div>

        {/* Navigation Items */}
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

        {/* User Info & Logout */}
        <div className="p-4 border-t border-gray-100">
          <div className="flex items-center gap-3 px-3 py-3 mb-2">
            {user?.avatar ? (
              <img
                src={user.avatar}
                alt={user.fullName}
                className="w-8 h-8 rounded-full object-cover"
              />
            ) : (
              <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                {user?.fullName?.charAt(0) || 'U'}
              </div>
            )}
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-gray-900 truncate">
                {user?.fullName || 'User'}
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

