import { useEffect, useState, useRef } from 'react'
import { useParams, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import { Input } from '../components/ui/Input'
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
  Edit2,
  Trash2,
  X,
} from 'lucide-react'
import { getMeetingById, getMeetingParticipants, updateAttendanceStatus, updateMeeting, deleteMeeting } from '../services/meeting.api'
import { getUserById } from '../services/user.api'
import type { Meeting, AttendingStatus, UpdateMeetingData } from '../types/meeting.types'
import MeetingMap from '../components/MeetingMap'

/**
 * MeetingDetailsPage - NOW CONNECTED TO BACKEND!
 * 
 * Backend Integration:
 * - GET /api/v1/meetings/:id - Fetch meeting details
 * - GET /api/v1/meetings/:id/participants - Fetch participants
 * - PATCH /api/v1/meetings/:id/attend-status - Update user's RSVP
 */

interface Participant {
  userId: string
  fullName: string
  email: string
  status: AttendingStatus
}

interface Organizer {
  userId: string
  fullName: string
  email: string
}

function MeetingDetails() {
  const { id: meetingId } = useParams()
  const navigate = useNavigate()
  const { user } = useAuth()
  
  // State
  const [meeting, setMeeting] = useState<Meeting | null>(null)
  const [participants, setParticipants] = useState<Participant[]>([])
  const [organizer, setOrganizer] = useState<Organizer | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string>('')
  const [isDropdownOpen, setIsDropdownOpen] = useState(false)
  const [isUpdatingStatus, setIsUpdatingStatus] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)
  
  // Edit mode state
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [editError, setEditError] = useState<string>('')
  const [formData, setFormData] = useState({
    title: '',
    location: '',
    startTime: '',
    endTime: '',
    notes: '',
  })

  // Fetch meeting data
  useEffect(() => {
    const fetchMeetingData = async () => {
      if (!meetingId) return
      
      try {
        setIsLoading(true)
        setError('')
        
        // Fetch meeting details and participants
        const [meetingData, participantsData] = await Promise.all([
          getMeetingById(meetingId),
          getMeetingParticipants(meetingId)
        ])
        
        setMeeting(meetingData)
        setParticipants(participantsData)
        
        // Always fetch organizer information from the backend using ownerId
        try {
          const ownerData = await getUserById(meetingData.ownerId)
          setOrganizer({
            userId: ownerData.id,
            fullName: ownerData.fullName,
            email: ownerData.email
          })
        } catch (ownerErr) {
          console.error('Error fetching organizer:', ownerErr)
          // Fallback: try to find owner in participants list
          const ownerInfo = participantsData.find(p => p.userId === meetingData.ownerId)
          if (ownerInfo) {
            setOrganizer({
              userId: ownerInfo.userId,
              fullName: ownerInfo.fullName,
              email: ownerInfo.email
            })
          } else if (user?.id === meetingData.ownerId) {
            // Last resort: use current user's info if they're the owner
            setOrganizer({
              userId: user.id,
              fullName: user.fullName,
              email: user.email
            })
          }
        }
      } catch (err: any) {
        console.error('Error fetching meeting:', err)
        setError(err.response?.data?.message || 'Failed to load meeting details')
      } finally {
        setIsLoading(false)
      }
    }

    fetchMeetingData()
  }, [meetingId, user])

  const handleStatusChange = async (status: AttendingStatus) => {
    if (!meetingId || !meeting) return

    try {
      setIsUpdatingStatus(true)
      await updateAttendanceStatus(meetingId, status)
      
      // Update local state
      setMeeting({ ...meeting, userStatus: status })
      
      // Update participant list
      if (user) {
        setParticipants(participants.map(p =>
          p.userId === user.id ? { ...p, status } : p
        ))
      }
      
      setIsDropdownOpen(false)
    } catch (err: any) {
      console.error('Error updating status:', err)
      alert(err.response?.data?.message || 'Failed to update status')
    } finally {
      setIsUpdatingStatus(false)
    }
  }

  const handleEdit = () => {
    if (!meeting) return
    
    // Convert ISO strings to datetime-local format
    const formatDateTimeForInput = (isoString: string) => {
      const date = new Date(isoString)
      return date.toISOString().slice(0, 16) // Format: YYYY-MM-DDTHH:mm
    }
    
    setFormData({
      title: meeting.title,
      location: meeting.location || '',
      startTime: formatDateTimeForInput(meeting.startTime),
      endTime: formatDateTimeForInput(meeting.endTime),
      notes: meeting.notes || '',
    })
    setIsEditing(true)
    setEditError('')
  }

  const handleCancel = () => {
    setIsEditing(false)
    setEditError('')
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!meetingId || !meeting) return

    setEditError('')
    setIsSaving(true)
    setShowSuccess(false)

    try {
      // Client-side validation
      const startDate = new Date(formData.startTime)
      const endDate = new Date(formData.endTime)
      
      if (endDate <= startDate) {
        setEditError('End time must be after start time')
        setIsSaving(false)
        return
      }
      
      // Check meeting duration (max 8 hours)
      const durationMs = endDate.getTime() - startDate.getTime()
      const durationHours = durationMs / (1000 * 60 * 60)
      if (durationHours > 8) {
        setEditError('Meeting cannot be longer than 8 hours')
        setIsSaving(false)
        return
      }
      
      // Allow editing meetings that are happening soon (within next hour for timezone tolerance)
      const oneHourAgo = new Date(Date.now() - 60 * 60 * 1000)
      if (startDate < oneHourAgo) {
        setEditError('Cannot update meetings that started more than 1 hour ago')
        setIsSaving(false)
        return
      }
      
      // Prepare updates - send all fields to backend
      const updates: UpdateMeetingData = {
        title: formData.title,
        location: formData.location,
        // Convert datetime-local format to ISO string for backend
        startTime: startDate.toISOString(),
        endTime: endDate.toISOString(),
        notes: formData.notes || undefined,
      }

      console.log('Sending updates to backend:', updates)
      const updatedMeeting = await updateMeeting(meetingId, updates)
      setMeeting(updatedMeeting)
      setIsEditing(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error updating meeting:', err)
      console.error('Error response:', err.response?.data)
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors
          .map((e: any) => {
            const field = e.path || e.param || e.field || 'unknown'
            const msg = e.msg || e.message || 'validation error'
            return `${field}: ${msg}`
          })
          .join('\n')
        setEditError(errorMessages)
      } else if (err.response?.data?.message) {
        setEditError(err.response.data.message)
      } else {
        setEditError('Failed to update meeting. Please check your input and try again.')
      }
    } finally {
      setIsSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!meetingId || !meeting) return

    const confirmed = window.confirm(
      `Are you sure you want to delete "${meeting.title}"?\n\nThis action cannot be undone and will remove the meeting for all participants.`
    )

    if (!confirmed) return

    try {
      await deleteMeeting(meetingId)
      alert('Meeting deleted successfully')
      navigate('/home')
    } catch (err: any) {
      console.error('Error deleting meeting:', err)
      alert(err.response?.data?.message || 'Failed to delete meeting')
    }
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

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading meeting...</p>
        </div>
      </div>
    )
  }

  // Error state
  if (error || !meeting) {
    return (
      <div className="max-w-4xl mx-auto">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-indigo-600 mb-4"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </Button>
        <Card>
          <CardContent className="p-12 text-center">
            <div className="w-12 h-12 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
              <Calendar className="w-6 h-6 text-red-600" />
            </div>
            <h3 className="text-lg font-semibold text-gray-900 mb-2">
              {error || 'Meeting not found'}
            </h3>
            <Button onClick={() => navigate('/home')}>
              Back to Home
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  const userStatus = meeting.userStatus || 'pending'
  const isOwner = user?.id === meeting.ownerId

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div className="flex items-center justify-between">
        <Button
          variant="ghost"
          className="pl-0 hover:bg-transparent hover:text-indigo-600"
          onClick={() => navigate('/home')}
        >
          <ArrowLeft className="w-4 h-4 mr-2" />
          Back to Meetings
        </Button>
        
        {/* Owner Actions */}
        {isOwner && !isEditing && (
          <div className="flex items-center gap-2">
            <Button variant="outline" onClick={handleEdit}>
              <Edit2 className="w-4 h-4 mr-2" />
              Edit Meeting
            </Button>
            <Button variant="outline" onClick={handleDelete} className="text-red-600 hover:text-red-700 hover:bg-red-50">
              <Trash2 className="w-4 h-4 mr-2" />
              Delete
            </Button>
          </div>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Meeting updated successfully!
          </p>
        </div>
      )}

      <div className="flex flex-col md:flex-row md:items-start justify-between gap-6">
        <div>
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            {meeting.title}
          </h1>
          <div className="flex flex-wrap gap-4 text-gray-600">
            <div className="flex items-center gap-2">
              <Calendar className="w-4 h-4 text-indigo-500" />
              <span>{formatDate(meeting.startTime)}</span>
            </div>
            <div className="flex items-center gap-2">
              <Clock className="w-4 h-4 text-indigo-500" />
              <span>
                {formatTime(meeting.startTime)} -{' '}
                {formatTime(meeting.endTime)}
              </span>
            </div>
          </div>
        </div>

        {/* Status Actions - Only show for participants, not owner */}
        {!isOwner && !isEditing && (
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
                  disabled={isUpdatingStatus}
                  className="bg-green-600 hover:bg-green-700"
                >
                  Accept
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handleStatusChange('declined')}
                  disabled={isUpdatingStatus}
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
                        : 'bg-red-50 text-red-700 border-red-200',
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
                    disabled={isUpdatingStatus}
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
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <CheckCircle className="w-4 h-4" />
                      Attending
                    </button>

                    <button
                      onClick={() => handleStatusChange('declined')}
                      className="w-full text-left px-4 py-2 text-sm flex items-center gap-2 hover:bg-gray-50 transition-colors text-gray-700"
                    >
                      <XCircle className="w-4 h-4" />
                      Declined
                    </button>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      <form onSubmit={handleSave}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="md:col-span-2 space-y-6">
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Details</h2>
              </CardHeader>
              <CardContent className="space-y-6">
                {/* Edit Mode */}
                {isEditing && isOwner ? (
                  <>
                    <Input
                      label="Title"
                      value={formData.title}
                      onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                      required
                    />
                    
                    <Input
                      label="Location"
                      value={formData.location}
                      onChange={(e) => setFormData({ ...formData, location: e.target.value })}
                      icon={<MapPin className="w-4 h-4" />}
                      required
                    />
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Input
                        label="Start Time"
                        type="datetime-local"
                        value={formData.startTime}
                        onChange={(e) => setFormData({ ...formData, startTime: e.target.value })}
                        icon={<Clock className="w-4 h-4" />}
                        required
                      />
                      <Input
                        label="End Time"
                        type="datetime-local"
                        value={formData.endTime}
                        onChange={(e) => setFormData({ ...formData, endTime: e.target.value })}
                        icon={<Clock className="w-4 h-4" />}
                        required
                      />
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1.5">
                        Notes (Optional)
                      </label>
                      <textarea
                        className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                        value={formData.notes}
                        onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                        placeholder="Add any additional details about the meeting..."
                      />
                    </div>

                    {/* Error Display */}
                    {editError && (
                      <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 whitespace-pre-line">
                        {editError}
                      </div>
                    )}

                    {/* Action Buttons */}
                    <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                      <Button
                        type="button"
                        variant="ghost"
                        onClick={handleCancel}
                        disabled={isSaving}
                      >
                        <X className="w-4 h-4 mr-2" />
                        Cancel
                      </Button>
                      <Button type="submit" isLoading={isSaving}>
                        <CheckCircle className="w-4 h-4 mr-2" />
                        Save Changes
                      </Button>
                    </div>
                  </>
                ) : (
                  /* View Mode */
                  <>
                    {meeting.location && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Location
                        </h3>
                        <div className="flex items-center gap-2 text-gray-900 mb-4">
                          <MapPin className="w-5 h-5 text-gray-400" />
                          {meeting.location}
                        </div>
                        
                        {/* Google Maps - Worldwide Support */}
                        <div className="mt-4">
                          <MeetingMap 
                            location={meeting.location}
                            locationCountry={meeting.locationCountry || undefined}
                            latitude={meeting.latitude || undefined}
                            longitude={meeting.longitude || undefined}
                            onError={(error) => console.error('Map error:', error)}
                          />
                        </div>
                      </div>
                    )}

                    {meeting.notes && (
                      <div>
                        <h3 className="text-sm font-medium text-gray-500 mb-2">
                          Notes
                        </h3>
                        <p className="text-gray-700 whitespace-pre-wrap leading-relaxed">
                          {meeting.notes}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </CardContent>
            </Card>
          </div>

        {/* Sidebar Info */}
        <div className="space-y-6">
          <Card>
            <CardHeader>
              <h2 className="text-lg font-semibold text-gray-900">
                Participants ({participants.length})
              </h2>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {participants.map((p) => (
                  <div key={p.userId} className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gray-100 rounded-full flex items-center justify-center text-xs font-medium text-gray-600">
                        {p.fullName.charAt(0)}
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-medium text-gray-900">
                          {p.fullName}
                          {p.userId === meeting.ownerId && (
                            <span className="ml-2 text-xs text-indigo-600">(Owner)</span>
                          )}
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

          {/* Organizer Card - Always displayed */}
          {organizer && (
            <Card>
              <CardHeader>
                <h2 className="text-lg font-semibold text-gray-900">Organizer</h2>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 font-bold">
                    {organizer.fullName.charAt(0)}
                  </div>
                  <div>
                    <p className="text-sm font-medium text-gray-900">
                      {organizer.fullName}
                    </p>
                    <p className="text-xs text-gray-500">
                      {organizer.email}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
      </form>
    </div>
  )
}

export default MeetingDetails
