import { useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import {
  X,
  Calendar,
  Clock,
  MapPin,
  FileText,
  UserPlus,
} from 'lucide-react'
import { createMeeting } from '../services/meeting.api'
import type { CreateMeetingData } from '../types/meeting.types'

/**
 * NewMeetingPage - NOW CONNECTED TO BACKEND!
 * 
 * Backend Integration:
 * - POST /api/v1/meetings - Creates meeting with participants
 * - Validates all fields on backend
 * - Automatically invites participants
 */

function NewMeeting() {
  const navigate = useNavigate()
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string>('')
  
  // Participant emails
  const [participants, setParticipants] = useState<string[]>([])
  const [newParticipantEmail, setNewParticipantEmail] = useState('')

  // Form fields
  const [title, setTitle] = useState('')
  const [startTime, setStartTime] = useState('')
  const [endTime, setEndTime] = useState('')
  const [location, setLocation] = useState('')
  const [notes, setNotes] = useState('')

  const handleAddParticipant = (e: React.FormEvent) => {
    e.preventDefault()
    
    // Validation
    if (!newParticipantEmail) return
    if (participants.includes(newParticipantEmail)) {
      alert('This email is already added')
      return
    }
    
    // Add to list
    setParticipants([...participants, newParticipantEmail])
    setNewParticipantEmail('')
  }

  const removeParticipant = (email: string) => {
    setParticipants(participants.filter((p) => p !== email))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      // Client-side validation
      const startDate = new Date(startTime)
      const endDate = new Date(endTime)
      
      // Check if end time is after start time
      if (endDate <= startDate) {
        setError('End time must be after start time')
        setIsLoading(false)
        return
      }
      
      // Check meeting duration (max 8 hours)
      const durationMs = endDate.getTime() - startDate.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)
      if (durationHours > 8) {
        setError('Meeting cannot be longer than 8 hours')
        setIsLoading(false)
        return
      }
      
      // Prepare data for backend
      const meetingData: CreateMeetingData = {
        title,
        startTime, // Backend expects ISO string
        endTime,
        location,
        notes: notes || undefined,
        emails: participants, // List of participant emails
        status: 'pending', // Default status for new participants
      }

      console.log('Creating meeting:', meetingData)
      
      // Create meeting via API
      const result = await createMeeting(meetingData)
      
      console.log('Meeting created:', result)
      
      // Success! Redirect to home
      navigate('/home')
    } catch (err: any) {
      console.error('Error creating meeting:', err)
      
      // Handle validation errors
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors
          .map((e: any) => e.msg)
          .join('\n')
        setError(errorMessages)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to create meeting. Please try again.')
      }
    } finally {
      setIsLoading(false)
    }
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
              label="Location (Optional)"
              placeholder="e.g., Tour Eiffel, Paris or דיזנגוף 50, תל אביב or Conference Room A"
              value={location}
              onChange={(e) => setLocation(e.target.value)}
              maxLength={500}
              icon={<MapPin className="w-4 h-4" />}
            />
            <p className="text-xs text-gray-500 mt-1 ml-1">
              Supports addresses worldwide in any language. Leave empty for virtual meetings.
            </p>

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
                {participants.map((email) => (
                  <div
                    key={email}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg border border-gray-100"
                  >
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold text-xs">
                        {email.charAt(0).toUpperCase()}
                      </div>
                      <span className="text-sm font-medium text-gray-700">
                        {email}
                      </span>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeParticipant(email)}
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

        {/* Error Display */}
        {error && (
          <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 whitespace-pre-line">
            {error}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex items-center justify-end gap-4">
          <Button
            type="button"
            variant="ghost"
            onClick={() => navigate('/home')}
            disabled={isLoading}
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
