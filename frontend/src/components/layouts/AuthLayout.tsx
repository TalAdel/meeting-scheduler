import { useState } from 'react'
import { Outlet, Navigate } from 'react-router-dom'
import { useAuth } from '../../context/AuthContext'
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
            {/* In production, you'd render the sidebar content here for mobile */}
            <div className="p-6">
              <p className="text-sm text-gray-500">
                Please use desktop for full sidebar experience or implement
                mobile drawer.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Main Content Area */}
      <main className="md:ml-64 min-h-screen p-4 md:p-8 max-w-7xl mx-auto">
        <Outlet />
      </main>
    </div>
  )
}

