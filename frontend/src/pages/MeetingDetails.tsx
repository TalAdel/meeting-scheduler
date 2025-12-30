import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
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

/**
 * MeetingDetailsPage Component
 * 
 * WHY? Shows complete meeting information with RSVP functionality
 * 
 * The Logic Behind the UX:
 * 1. Large title and date draw attention to key info
 * 2. Status dropdown allows easy RSVP changes
 * 3. Map embed shows location visually
 * 4. Participant list shows attendance status
 * 5. Organizer info provides contact context
 * 
 * RSVP Flow:
 * - Pending: Show Accept/Decline buttons
 * - Confirmed/Declined: Show status with dropdown to change
 * - Dropdown allows status change at any time
 * 
 * State Management:
 * - userStatus: current user's RSVP status
 * - isDropdownOpen: dropdown visibility
 * - Mock data for now (will fetch from API)
 */

type AttendingStatus = 'pending' | 'confirmed' | 'declined' | 'attended'

// Mock meeting data
const mockMeeting = {
  id: 'm-1',
  title: 'Q4 Product Roadmap Review',
  start_time: new Date(Date.now() + 86400000).toISOString(),
  end_time: new Date(Date.now() + 90000000).toISOString(),
  location: 'Conference Room A',
  notes:
    'Reviewing the upcoming features for Q4. Please bring your status reports.',
  owner_id: 'user-1',
  participants: [
    { email: 'sarah@example.com', status: 'confirmed' as const, name: 'Sarah Jones' },
    { email: 'mike@example.com', status: 'pending' as const, name: 'Mike Chen' },
    { email: 'alex.morgan@example.com', status: 'pending' as const, name: 'Alex Morgan' },
  ],
  created_at: new Date().toISOString(),
  updated_at: new Date().toISOString(),
}

const mockUser = {
  email: 'alex.morgan@example.com',
}

function MeetingDetails() {
  const { id: meetingId } = useParams()
  const navigate = useNavigate()
  const [userStatus, setUserStatus] = useState<AttendingStatus>('pending')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Use meetingId for future API calls
  console.log('Meeting ID:', meetingId)

  // Initialize user status from meeting data
  useEffect(() => {
    const participant = mockMeeting.participants.find(
      (p) => p.email === mockUser.email,
    )
    if (participant) {
      setUserStatus(participant.status)
    }
  }, [])

  const handleStatusChange = (status: AttendingStatus) => {
    setUserStatus(status)
    // TODO: Call API to update status
    console.log('Updating status to:', status)
    setIsDropdownOpen(false)
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
            {mockMeeting.title}
              </h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{formatDate(mockMeeting.start_time)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>
                {formatTime(mockMeeting.start_time)} -{' '}
                {formatTime(mockMeeting.end_time)}
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
                      'text-gray-700',
                    )}
                  >
                    <HelpCircle className="w-4 h-4" />
                    Maybe
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
                  {mockMeeting.location}
                </div>
                {/* Map Placeholder */}
                <div className="w-full h-64 bg-gray-100 rounded-lg overflow-hidden border border-gray-200 flex items-center justify-center">
                  <div className="text-center text-gray-500">
                    <MapPin className="w-12 h-12 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">Map view would appear here</p>
                  </div>
                </div>
              </div>

                <div>
                <h3 className="text-sm font-medium text-gray-500 mb-2">
                    Notes
                  </h3>
                <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                  {mockMeeting.notes}
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
                {mockMeeting.participants.map((p, i) => (
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

export default MeetingDetails
