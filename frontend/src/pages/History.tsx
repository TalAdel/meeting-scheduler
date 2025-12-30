import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatDate, formatTime } from '../lib/utils'
import { Calendar, Clock, ArrowRight } from 'lucide-react'

/**
 * HistoryPage Component
 * 
 * WHY? Shows completed meetings for reference and records
 * 
 * The Logic Behind the UX:
 * 1. Reverse chronological order (most recent first)
 * 2. Card-based layout for easy scanning
 * 3. Date badge for quick identification
 * 4. "attended" status badge for all past meetings
 * 5. Click to view details
 * 
 * Design Pattern:
 * - Simple list view (no complex filtering needed for history)
 * - Visual differentiation from upcoming meetings (muted colors)
 * - Empty state encourages first meeting
 * 
 * State Management:
 * - Mock data for now (will fetch from API)
 * - Filtered to show only past meetings
 * - Sorted by date (newest first)
 */

// Mock past meetings
const mockPastMeetings = [
  {
    id: 'm-3',
    title: 'Client Kickoff - Acme Corp',
    start_time: new Date(Date.now() - 86400000).toISOString(), // Yesterday
    end_time: new Date(Date.now() - 82800000).toISOString(),
    location: '123 Business Rd, Tech City',
    notes: 'Initial kickoff meeting with the new client.',
    owner_id: 'user-1',
    participants: [
      { email: 'client@acme.com', status: 'attended' as const, name: 'John Doe' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
  {
    id: 'm-4',
    title: 'Sprint Planning - Q3',
    start_time: new Date(Date.now() - 172800000).toISOString(), // 2 days ago
    end_time: new Date(Date.now() - 169200000).toISOString(),
    location: 'Virtual (Zoom)',
    notes: 'Planning for Q3 sprint goals.',
    owner_id: 'user-1',
    participants: [
      { email: 'team@example.com', status: 'attended' as const, name: 'Team Member' },
    ],
    created_at: new Date().toISOString(),
    updated_at: new Date().toISOString(),
  },
]

function History() {
  const pastMeetings = mockPastMeetings.sort(
    (a, b) =>
      new Date(b.start_time).getTime() - new Date(a.start_time).getTime(),
  )

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meeting History</h1>
        <div className="text-sm text-gray-500">
          Total: {pastMeetings.length} meetings
        </div>
      </div>

      <div className="grid gap-4">
        {pastMeetings.length > 0 ? (
          pastMeetings.map((meeting) => (
            <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
              <Card
                hover
                className="group opacity-75 hover:opacity-100 transition-opacity"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-100 rounded-lg text-gray-500 border border-gray-200">
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
                        <StatusBadge status="attended" />
                      </div>
                    </div>
                  </div>
                  <ArrowRight className="w-5 h-5 text-gray-300 group-hover:text-indigo-500 transition-colors" />
                </CardContent>
              </Card>
            </Link>
          ))
        ) : (
          <Card className="bg-gray-50 border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-12 text-center">
              <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center mb-4">
                <Calendar className="w-6 h-6 text-gray-500" />
              </div>
              <h3 className="text-lg font-medium text-gray-900">
                No past meetings
              </h3>
              <p className="text-gray-500 mt-1">
                Your meeting history will appear here.
              </p>
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

export default History
