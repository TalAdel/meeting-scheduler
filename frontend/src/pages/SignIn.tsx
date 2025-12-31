import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signIn } from '../services/auth.api'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Calendar, Mail, Lock } from 'lucide-react'

/**
 * SignInPage Component
 * 
 * WHY this design?
 * - Consistent with SignUp page for familiar UX
 * - Clear visual hierarchy with centered layout
 * - Icons provide context and improve scannability
 * - Loading states prevent confusion during async operations
 * 
 * The Logic Behind the UX:
 * 1. Minimal form fields reduce friction (only email + password)
 * 2. Clear error messages help users fix issues
 * 3. Link to sign up for new users (conversion optimization)
 * 4. Loading spinner prevents double submissions
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: Handles only sign-in UI and logic
 * - Dependency Inversion: Depends on signIn API abstraction
 * - Open/Closed: Uses reusable Button and Input components
 */

function SignIn() {
  const navigate = useNavigate()
  const { login } = useAuth()
  
  // Form state
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  
  // UI state
  const [error, setError] = useState<string>('')
  const [isLoading, setIsLoading] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      const response = await signIn({ email, password })
      console.log('Signin successful:', response)
      
      // Save auth data and redirect to home
      login(response.user, response.token)
      navigate('/home')
      
    } catch (err: any) {
      console.error('Signin error:', err)
      
      // Handle different error formats from the API
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        // Join errors with newline for better readability
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join('\n')
        setError(errorMessages)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err.message || 'Sign in failed')
      }
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8 border border-gray-100">
        {/* Header with branding */}
        <div className="text-center mb-8">
          <div className="w-12 h-12 bg-indigo-600 rounded-xl flex items-center justify-center mx-auto mb-4">
            <Calendar className="w-6 h-6 text-white" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Welcome back</h1>
          <p className="text-gray-600 mt-2">
            Sign in to access your meetings
          </p>
        </div>

        {/* Sign In Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Email Input */}
          <Input
            label="Email address"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            icon={<Mail className="w-4 h-4" />}
          />

          {/* Password Input */}
          <Input
            label="Password"
            type="password"
            placeholder="••••••••"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
            icon={<Lock className="w-4 h-4" />}
          />

          {/* Error Display */}
          {error && (
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 whitespace-pre-line">
              {error}
            </div>
          )}

          {/* Submit Button */}
          <Button
          type="submit"
            className="w-full"
            size="lg"
            isLoading={isLoading}
        >
            Sign In
          </Button>
      </form>

        {/* Sign Up Link */}
        <div className="mt-6 text-center text-sm text-gray-600">
          Don't have an account?{' '}
          <Link
            to="/signup"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            Sign up
          </Link>
        </div>

        {/* Back to Home Link */}
        <div className="text-center text-sm text-gray-600">
          <Link
            to="/"
            className="text-indigo-600 font-medium hover:text-indigo-700"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  )
}

export default SignIn
