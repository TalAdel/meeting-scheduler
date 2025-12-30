import { useMemo, useState } from 'react'
import { Link } from 'react-router-dom'
import { FilterBar } from '../components/FilterBar'
import type { FilterState } from '../components/FilterBar'
import { Card, CardContent } from '../components/ui/Card'
import { Button } from '../components/ui/Button'
import { Plus, Calendar, Clock, MapPin, ChevronRight } from 'lucide-react'
import { formatDate, formatTime } from '../lib/utils'

/**
 * HomePage Component
 * 
 * WHY? Main dashboard showing upcoming meetings with powerful filtering
 * 
 * The Logic Behind the UX:
 * 1. Hero card for next meeting (most important)
 * 2. Filterable list of upcoming meetings
 * 3. Quick action button to create new meeting
 * 4. Participant avatars for quick identification
 * 5. Empty states guide users to take action
 * 
 * State Management:
 * - Mock data for now (will connect to API later)
 * - Filter state managed by FilterBar component
 * - Filtered meetings computed from filters
 * 
 * Design Pattern:
 * - Hero section draws attention to next meeting
 * - List view for scanning multiple meetings
 * - Card-based layout for clean organization
 */

// Mock user data (will come from AuthContext)
const mockUser = {
  id: 'user-1',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
}

// Mock meetings data (will come from API)
const mockMeetings = [
  {
    id: 'm-1',
    title: 'Q4 Product Roadmap Review',
    start_time: new Date(Date.now() + 86400000).toISOString(), // Tomorrow
    end_time: new Date(Date.now() + 90000000).toISOString(),
    location: 'Conference Room A',
    notes: 'Reviewing the upcoming features for Q4.',
    owner_id: 'user-1',
    participants: [
      { email: 'sarah@example.com', status: 'confirmed' as const, name: 'Sarah Jones' },
      { email: 'mike@example.com', status: 'pending' as const, name: 'Mike Chen' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-2',
    title: 'Design Sync',
    start_time: new Date(Date.now() + 172800000).toISOString(), // Day after tomorrow
    end_time: new Date(Date.now() + 176400000).toISOString(),
    location: 'Virtual (Zoom)',
    notes: 'Weekly design sync.',
    owner_id: 'user-1',
    participants: [
      { email: 'jessica@example.com', status: 'confirmed' as const, name: 'Jessica Wu' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function Home() {
  const [filters, setFilters] = useState<FilterState>({
    statuses: [],
    dateRange: 'all',
    myMeetingsOnly: false,
  })

  // Filter and sort meetings
  const filteredMeetings = useMemo(() => {
    let filtered = mockMeetings.filter((m) => new Date(m.start_time) > new Date())

    // Filter by status (check if user's status in participants matches)
    if (filters.statuses.length > 0) {
      filtered = filtered.filter((meeting) => {
        const userParticipant = meeting.participants.find(
          (p) => p.email === mockUser.email,
        )
        return (
          userParticipant && filters.statuses.includes(userParticipant.status)
        )
      })
    }

    // Filter by date range
    if (filters.dateRange !== 'all') {
      const now = new Date()
      const today = new Date(now.getFullYear(), now.getMonth(), now.getDate())
      filtered = filtered.filter((meeting) => {
        const meetingDate = new Date(meeting.start_time)
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
    if (filters.myMeetingsOnly) {
      filtered = filtered.filter((meeting) => meeting.owner_id === mockUser.id)
    }

    return filtered.sort(
      (a, b) =>
        new Date(a.start_time).getTime() - new Date(b.start_time).getTime(),
    )
  }, [filters])

  const nextMeeting = filteredMeetings[0]
  const otherMeetings = filteredMeetings.slice(1)

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Welcome back, {mockUser.fullName.split(' ')[0]}
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
                    <h3 className="text-2xl font-bold text-gray-900">
                      {nextMeeting.title}
                    </h3>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-gray-600">
                    <div className="flex items-center gap-2">
                      <Calendar className="w-5 h-5 text-indigo-500" />
                      <span>{formatDate(nextMeeting.start_time)}</span>
                    </div>
                    <div className="flex items-center gap-2">
                      <Clock className="w-5 h-5 text-indigo-500" />
                      <span>
                        {formatTime(nextMeeting.start_time)} -{' '}
                        {formatTime(nextMeeting.end_time)}
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
            Upcoming Meetings
          </h2>
          <div className="grid gap-4">
            {otherMeetings.map((meeting) => (
              <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
                <Card hover className="group">
                  <CardContent className="flex items-center justify-between p-5">
                    <div className="flex items-center gap-6">
                      <div className="flex flex-col items-center justify-center w-14 h-14 bg-indigo-50 rounded-lg text-indigo-700 border border-indigo-100">
                        <span className="text-xs font-bold uppercase">
                          {new Date(meeting.start_time).toLocaleDateString(
                            'en-US',
                            {
                              month: 'short',
                            },
                          )}
                        </span>
                        <span className="text-xl font-bold">
                          {new Date(meeting.start_time).getDate()}
                        </span>
                      </div>
                      <div>
                        <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                          {meeting.title}
                        </h3>
                        <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                          <span className="flex items-center gap-1">
                            <Clock className="w-3.5 h-3.5" />
                            {formatTime(meeting.start_time)}
                          </span>
                          <span>•</span>
                          <span className="truncate max-w-[200px]">
                            {meeting.location}
                          </span>
                        </div>
                      </div>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="hidden sm:flex -space-x-2">
                        {meeting.participants.slice(0, 3).map((p, i) => (
                          <div
                            key={i}
                            className="w-8 h-8 rounded-full bg-gray-200 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-600"
                          >
                            {p.name ? p.name.charAt(0) : p.email.charAt(0)}
                          </div>
                        ))}
                        {meeting.participants.length > 3 && (
                          <div className="w-8 h-8 rounded-full bg-gray-100 border-2 border-white flex items-center justify-center text-xs font-medium text-gray-500">
                            +{meeting.participants.length - 3}
                          </div>
                        )}
                      </div>
                      <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-indigo-500 transition-colors" />
                    </div>
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
