import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import ProtectedRoute from './components/ProtectedRoute';
import Landing from './pages/Landing';
import SignIn from './pages/SignIn';
import SignUp from './pages/SignUp';
import Home from './pages/Home';
import NewMeeting from './pages/NewMeeting';
import EditMeeting from './pages/EditMeeting';
import MeetingDetails from './pages/MeetingDetails';
import History from './pages/History';
import Profile from './pages/Profile';
import './App.css';

/**
 * App Component - Root of the application
 * 
 * Routes:
 * - Public: /, /signin, /signup
 * - Protected: /home, /new-meeting, /history, /profile
 * 
 * WHY Protected Routes?
 * - Security: Only authenticated users can access certain pages
 * - UX: Automatically redirect to signin if not logged in
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
          
          {/* Protected Routes - Require Authentication */}
          <Route 
            path="/home" 
            element={
              <ProtectedRoute>
                <Home />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/new-meeting" 
            element={
              <ProtectedRoute>
                <NewMeeting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/edit-meeting/:id" 
            element={
              <ProtectedRoute>
                <EditMeeting />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/meeting/:id" 
            element={
              <ProtectedRoute>
                <MeetingDetails />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/history" 
            element={
              <ProtectedRoute>
                <History />
              </ProtectedRoute>
            } 
          />
          <Route 
            path="/profile" 
            element={
              <ProtectedRoute>
                <Profile />
              </ProtectedRoute>
            } 
          />
        </Routes>
      </AuthProvider>
    </Router>
  );
}

export default App;
