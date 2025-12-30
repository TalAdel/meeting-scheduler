import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import {
  Plus,
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  UserPlus,
} from 'lucide-react'

/**
 * NewMeetingPage Component
 * 
 * WHY? Comprehensive form for creating meetings
 * 
 * The Logic Behind the UX:
 * 1. Grouped form fields (Details, Participants) reduce overwhelm
 * 2. Icons provide visual context for each field
 * 3. Dynamic participant list shows added emails
 * 4. Loading state prevents double submissions
 * 5. Cancel button provides escape route
 * 
 * Form Structure:
 * - Meeting Details: title, start/end time, location, notes
 * - Participants: dynamic list of email addresses
 * 
 * State Management:
 * - Form fields in local state
 * - Participants array managed separately
 * - Loading state for async operations
 * 
 * Validation:
 * - Required fields enforced by HTML5
 * - Email validation automatic
 * - End time must be after start time (HTML5 min attribute)
 */

interface Participant {
  email: string
  status: 'pending'
}

function NewMeeting() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [newParticipantEmail, setNewParticipantEmail] = useState('')

  // Form fields
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    if (
      newParticipantEmail &&
      !participants.find((p) => p.email === newParticipantEmail)
    ) {
      setParticipants([
        ...participants,
        {
          email: newParticipantEmail,
          status: 'pending',
        },
      ])
      setNewParticipantEmail('')
    }
  }

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p.email !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)

    // TODO: Replace with actual API call
    console.log('Creating meeting:', {
      title,
      startTime,
      endTime,
      location,
      notes,
      participants,
    })

    // Simulate API call
    setTimeout(() => {
      setIsLoading(false)
      navigate('/home')
    }, 1000)
  }

  return (
    <div className="max-w-3xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900">
          Schedule New Meeting
        </h1>
        <p className="text-gray-600 mt-1">
          Fill in the details to invite your team.
        </p>
      </div>

      <form onSubmit={handleSubmit}>
        {/* Meeting Details Card */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Meeting Details
            </h2>
          </CardHeader>
          <CardContent className="space-y-6">
            <Input
              label="Meeting Title"
              placeholder="e.g., Q4 Roadmap Review"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              required
              maxLength={200}
            />

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <Input
                label="Start Time"
                type="datetime-local"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                required
                icon={<Calendar className="w-4 h-4" />}
              />
              <Input
                label="End Time"
                type="datetime-local"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                min={startTime}
                required
                icon={<Clock className="w-4 h-4" />}
              />
            </div>

            <Input
              label="Location"
              placeholder="e.g., Conference Room A or Zoom Link"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              required
              maxLength={255}
              icon={<MapPin className="w-4 h-4" />}
            />

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1.5">
                Notes / Agenda
              </label>
              <div className="relative">
                <div className="absolute left-3 top-3 text-gray-400">
                  <FileText className="w-4 h-4" />
                </div>
                <textarea
                  className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                  placeholder="Add meeting agenda or notes..."
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                />
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Participants Card */}
        <Card className="mb-8">
          <CardHeader>
            <h2 className="text-lg font-semibold text-gray-900">
              Participants
            </h2>
          </CardHeader>
          <CardContent>
            <div className="flex gap-3 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Enter email address"
                  type="email"
                  value={newParticipantEmail}
                  onChange={(e) => setNewParticipantEmail(e.target.value)}
                  icon={<UserPlus className="w-4 h-4" />}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') {
                      e.preventDefault()
                      handleAddParticipant(e)
                    }
                  }}
                />
              </div>
              <Button
                type="button"
                onClick={handleAddParticipant}
                variant="secondary"
              >
                Add
              </Button>
            </div>

            {participants.length > 0 ? (
              <div className="space-y-2">
                {participants.map((p) => (
                  <div
                    key={p.email}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {p.email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {p.email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(p.email)}
                      className="text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                ))}
              </div>
            ) : (
              <div className="text-center py-8 text-gray-500 text-sm border-2 border-dashed border-gray-200 rounded-lg">
                No participants added yet.
              </div>
            )}
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/home')}
          >
            Cancel
          </Button>
          <Button type="submit" size="lg" isLoading={isLoading}>
            Schedule Meeting
          </Button>
        </div>
      </form>
    </div>
  )
}

export default NewMeeting
