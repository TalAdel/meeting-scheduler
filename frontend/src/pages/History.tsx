import { useState, useEffect } from 'react'
import { Link } from 'react-router-dom'
import { Card, CardContent } from '../components/ui/Card'
import { StatusBadge } from '../components/ui/StatusBadge'
import { formatTime } from '../lib/utils'
import { Calendar, Clock, ArrowRight } from 'lucide-react'
import { getUserMeetings } from '../services/meeting.api'
import type { Meeting } from '../types/meeting.types'

/**
 * HistoryPage - NOW CONNECTED TO BACKEND!
 * 
 * Backend Integration:
 * - GET /api/v1/meetings - Fetches all meetings
 * - Filters to show only past meetings (startTime < now)
 * - Sorted by date (newest first)
 */

function History() {
  const [meetings, setMeetings] = useState<Meeting[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')

  useEffect(() => {
    const fetchMeetings = async () => {
      try {
        setIsLoading(true)
        setError('')
        const data = await getUserMeetings()
        
        // Filter and sort past meetings
        const pastMeetings = data
          .filter((m) => new Date(m.startTime) < new Date())
          .sort(
            (a, b) =>
              new Date(b.startTime).getTime() - new Date(a.startTime).getTime(),
          )
        
        setMeetings(pastMeetings)
      } catch (err: any) {
        console.error('Error fetching meetings:', err)
        setError(err.response?.data?.message || 'Failed to load meeting history')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetings()
  }, [])

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading history...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold text-gray-900">Meeting History</h1>
        <Card className="bg-red-50">
          <CardContent className="p-6 text-center">
            <p className="text-red-600">{error}</p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold text-gray-900">Meeting History</h1>
        <div className="text-sm text-gray-500">
          Total: {meetings.length} meetings
        </div>
      </div>

      <div className="grid gap-4">
        {meetings.length > 0 ? (
          meetings.map((meeting) => (
            <Link key={meeting.id} to={`/meeting/${meeting.id}`}>
              <Card
                hover
                className="group opacity-75 hover:opacity-100 transition-opacity"
              >
                <CardContent className="flex items-center justify-between p-5">
                  <div className="flex items-center gap-6">
                    <div className="flex flex-col items-center justify-center w-14 h-14 bg-gray-100 rounded-lg text-gray-500 border border-gray-200">
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
                      <h3 className="font-semibold text-gray-900 group-hover:text-indigo-600 transition-colors">
                        {meeting.title}
                      </h3>
                      <div className="flex items-center gap-3 text-sm text-gray-500 mt-1">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3.5 h-3.5" />
                          {formatTime(meeting.startTime)}
                        </span>
                        <span>•</span>
                        <StatusBadge status={meeting.userStatus || 'attended'} />
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
