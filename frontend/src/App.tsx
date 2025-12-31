import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom'
import { AuthProvider } from './context/AuthContext'
import { AuthLayout } from './components/layouts/AuthLayout'
import { LoadScript } from '@react-google-maps/api'
import Landing from './pages/Landing'
import SignIn from './pages/SignIn'
import SignUp from './pages/SignUp'
import Home from './pages/Home'
import NewMeeting from './pages/NewMeeting'
import MeetingDetails from './pages/MeetingDetails'
import History from './pages/History'
import Profile from './pages/Profile'
import './App.css'

function App() {
  const googleMapsApiKey = import.meta.env.VITE_GOOGLE_MAPS_API_KEY

  return (
    <LoadScript 
      googleMapsApiKey={googleMapsApiKey || ''}
      loadingElement={<div>Loading Maps...</div>}
    >
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
    </LoadScript>
  )
}

export default App
