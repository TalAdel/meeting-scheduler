import { Link } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Calendar, Check, Clock, Users } from 'lucide-react'

/**
 * LandingPage Component
 * 
 * WHY this design?
 * - Hero section with clear value proposition
 * - Visual hierarchy guides users to primary CTA
 * - Feature cards explain benefits clearly
 * - Modern, professional design builds trust
 * 
 * The Logic Behind the UX:
 * 1. Hero section: Capture attention with large heading and CTAs
 * 2. Gradient background: Modern feel without distracting
 * 3. Feature cards: Explain key benefits (Smart Scheduling, Collaboration, History)
 * 4. Dual CTAs: "Start for free" (primary) + "Sign In" (secondary)
 * 
 * Design Psychology:
 * - Large font sizes draw attention to value prop
 * - Icons help users scan features quickly
 * - White space reduces cognitive load
 * - Indigo color scheme conveys professionalism and trust
 */

function Landing() {
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
            {/* Feature 1: Smart Scheduling */}
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

            {/* Feature 2: Team Collaboration */}
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

            {/* Feature 3: Meeting History */}
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

export default Landing
