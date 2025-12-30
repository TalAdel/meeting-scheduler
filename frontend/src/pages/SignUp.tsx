import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { signUp } from '../services/auth.api'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Calendar, Mail, Lock, User } from 'lucide-react'

/**
 * SignUpPage Component
 * 
 * WHY this design?
 * - Clean, modern UI that reduces cognitive load
 * - Clear visual hierarchy guides user through the form
 * - Icons provide visual context for each field
 * - Loading states give feedback during async operations
 * 
 * The Logic Behind the UX:
 * 1. Centered layout focuses attention on the form
 * 2. Icons (Mail, Lock, User) help users quickly identify fields
 * 3. Real-time error feedback improves user experience
 * 4. Loading spinner prevents double submissions
 * 5. Clear link to sign in for existing users
 * 
 * SOLID Principles Applied:
 * - Single Responsibility: This component only handles sign-up UI and logic
 * - Open/Closed: Uses reusable Button and Input components
 * - Dependency Inversion: Depends on abstractions (signUp API) not concrete implementations
 */

function SignUp() {
  const navigate = useNavigate()
  
  // Form state - separated by concern
  const [name, setName] = useState('')
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
      // Map local state to API format
      const response = await signUp({
        fullName: name,
        email,
        password,
      })
      
      console.log('Signup successful:', response)
      
      // Success! Redirect to sign in
      alert('Account created successfully! Please sign in.')
      navigate('/signin')
      
    } catch (err: any) {
      console.error('Signup error:', err)
      
      // Handle different error formats from the API
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ')
        setError(errorMessages)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError(err.message || 'Signup failed')
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
          <h1 className="text-2xl font-bold text-gray-900">
            Create an account
          </h1>
          <p className="text-gray-600 mt-2">
            Start managing your meetings today
          </p>
        </div>

        {/* Sign Up Form */}
        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Full Name Input */}
          <Input
            label="Full Name"
            type="text"
            placeholder="John Doe"
            value={name}
            onChange={(e) => setName(e.target.value)}
            required
            icon={<User className="w-4 h-4" />}
          />

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
            <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600">
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
            Create Account
          </Button>
        </form>

        {/* Sign In Link */}
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

export default SignUp

