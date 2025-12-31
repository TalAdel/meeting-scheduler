import { useMemo, useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { FilterBar } from '../components/FilterBar'
import type { FilterState } from '../components/FilterBar'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { StatusBadge } from '../components/ui/StatusBadge'
import { Plus, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { formatDate, formatTime } from '../lib/utils'
import { getUserMeetings } from '../services/meeting.api'
import type { Meeting } from '../types/meeting.types'

/**
 * HomePage Component - NOW CONNECTED TO BACKEND!
 * 
 * WHY? Main dashboard showing upcoming meetings with powerful filtering
 * 
 * The Logic Behind connecting to backend:
 * 1. useEffect fetches real meetings on mount
 * 2. Loading state shows while fetching
 * 3. Error handling for failed requests
 * 4. Real data from database displays
 * 
 * Backend Integration:
 * - GET /api/v1/meetings - Fetches all user meetings
 * - Returns meetings with userStatus (user's RSVP status)
 * - Handles both owned and invited meetings
 */

function Home() {
  const { user } = useAuth()
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    dateRange: 'all',
    myMeetingsOnly: false,
  })

  // Backend integration state
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  // Fetch meetings from backend
  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true)
        setError('')
        const data = await getUserMeetings()
        setMeetings(data)
      } catch (err: any) {
        console.error('Error fetching meetings:', err)
        setError(err.response?.data?.message || 'Failed to load meetings')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  // Filter and sort meetings
  const filteredMeetings = useMemo(() => {
    // Only show upcoming meetings
    let filtered = meetings.filter((m) => new Date(m.startTime) > new Date())

    // Filter by status (user's RSVP status)
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((meeting) => {
        // Determine effective status
        let effectiveStatus = meeting.userStatus
        
        // If no userStatus but user is owner, treat as confirmed
        if (!effectiveStatus && meeting.ownerId === user?.id) {
          effectiveStatus = 'confirmed'
        }
        
        // If still no status, default to pending
        if (!effectiveStatus) {
          effectiveStatus = 'pending'
        }
        
        // Check if effective status matches any selected filters
        return filters.statuses.some(status => status === effectiveStatus)
      })
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter((meeting) => {
        const meetingDate = new Date(meeting.startTime)
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
      filtered = filtered.filter((meeting) => meeting.ownerId === user.id)
    }

    return filtered.sort(
      (a, b) =>
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime(),
    )
  }, [meetings, filters, user])

  const nextMeeting = filteredMeetings[0]
  const otherMeetings = filteredMeetings.slice(1)

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meetings...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <Card className="max-w-md">
          <CardContent className="p-6 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              Failed to load meetings
            </h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <Button onClick={() => window.location.reload()}>
              Try Again
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {user?.fullName.split(' ')[0]}
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
                    {/* Show status badge - owners are automatically confirmed */}
                    {nextMeeting.userStatus ? (
                      <StatusBadge status={nextMeeting.userStatus} className="mb-3" />
                    ) : nextMeeting.ownerId === user?.id ? (
                      <StatusBadge status="confirmed" className="mb-3" />
                    ) : (
                      <StatusBadge status="pending" className="mb-3" />
                    )}
                    
                    <h3 className="text-2xl font-bold text-gray-900">
                      {nextMeeting.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span>{formatDate(nextMeeting.startTime)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <span>
                        {formatTime(nextMeeting.startTime)} -{' '}
                        {formatTime(nextMeeting.endTime)}
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
                    to={`/meeting/${nextMeeting.id}`}
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
            Upcoming Meetings ({otherMeetings.length})
          </h2>
          <div className="grid gap-4">
            {otherMeetings.map((meeting) => (
              <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
                <Card hover className="group">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-100">
                        <span className="text-xs font-bold uppercase">
                          {new Date(meeting.startTime).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                            },
                          )}
                        </span>
                        <span className="text-xl font-bold">
                          {new Date(meeting.startTime).getDate()}
                        </span>
                      </div>
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                            {meeting.title}
                          </h3>
                          {/* Show status badge - owners are automatically confirmed */}
                          {meeting.userStatus ? (
                            <StatusBadge status={meeting.userStatus} />
                          ) : meeting.ownerId === user?.id ? (
                            <StatusBadge status="confirmed" />
                          ) : (
                            <StatusBadge status="pending" />
                          )}
                        </div>
                        <div className="flex items-center gap-3 text-sm text-gray-500">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(meeting.startTime)}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">
                            {meeting.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
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

export default Home
