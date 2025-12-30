import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthLayout } from './components/layouts/AuthLayout'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import NewMeeting from './pages/NewMeeting'
import MeetingDetails from './pages/MeetingDetails'
import History from './pages/History'
import Profile from './pages/Profile'
import './App.css'

/**
 * App Component - Root of the application
 * 
 * WHY this structure?
 * - AuthProvider wraps everything for global auth state
 * - Public routes (/, /signin, /signup) are accessible to all
 * - Protected routes use AuthLayout which:
 *   1. Checks authentication
 *   2. Shows sidebar navigation
 *   3. Provides consistent layout
 * - Navigate redirects to landing for unknown routes
 * 
 * Route Structure:
 * Public:
 *   / - Landing page with hero and features
 *   /signin - User login
 *   /signup - User registration
 * 
 * Protected (requires authentication):
 *   /home - Dashboard with meeting list
 *   /meetings/new - Create new meeting
 *   /meeting/:id - View meeting details
 *   /history - Past meetings
 *   /profile - User profile settings
 * 
 * The Logic Behind AuthLayout:
 * - Instead of wrapping each route with ProtectedRoute
 * - We use a layout route that checks auth once
 * - All child routes inherit the sidebar and protection
 * - Cleaner code, better performance
 */

function App() {
  return (
    <Router>
      <AuthProvider>
        <Routes>
          {/* Public Routes */}
          <Route path="/" element={<Landing />} />
          <Route path="/signin" element={<SignIn />} />
          <Route path="/signup" element={<SignUp />} />

          {/* Protected Routes - All use AuthLayout */}
          <Route element={<AuthLayout />}>
            <Route path="/home" element={<Home />} />
            <Route path="/meetings/new" element={<NewMeeting />} />
            <Route path="/meeting/:id" element={<MeetingDetails />} />
            <Route path="/history" element={<History />} />
            <Route path="/profile" element={<Profile />} />
          </Route>

          {/* Fallback - Redirect to landing */}
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </AuthProvider>
    </Router>
  )
}

export default App
