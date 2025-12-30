import { useState } from 'react'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent } from '../components/ui/Card'
import {
  User,
  Mail,
  Briefcase,
  FileText,
  CheckCircle,
  Edit2,
  X,
} from 'lucide-react'

/**
 * ProfilePage Component
 * 
 * WHY? Allows users to manage their profile information
 * 
 * The Logic Behind the UX:
 * 1. View mode by default (non-destructive)
 * 2. Edit mode activated by button
 * 3. Visual feedback on save (success message)
 * 4. Cancel button to abandon changes
 * 5. Email field disabled (can't change email)
 * 
 * State Management:
 * - isEditing: toggle between view/edit mode
 * - formData: local copy of user data
 * - showSuccess: temporary success message
 * - isLoading: async save operation
 * 
 * Design Pattern:
 * - Single card layout focuses attention
 * - Icons provide visual context
 * - Success message auto-hides after 3 seconds
 * - Avatar placeholder shows user initials
 */

// Mock user data (will come from AuthContext)
const mockUser = {
  id: 'user-1',
  fullName: 'Alex Morgan',
  email: 'alex.morgan@example.com',
  title: 'Product Manager',
  bio: 'Passionate about building great products and organizing effective meetings.',
  avatar: '',
}

function Profile() {
  const [isLoading, setIsLoading] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [formData, setFormData] = useState({
    fullName: mockUser.fullName,
    email: mockUser.email,
    title: mockUser.title,
    bio: mockUser.bio,
  })

  const handleEdit = () => {
    // Reset form data when entering edit mode
    setFormData({
      fullName: mockUser.fullName,
      email: mockUser.email,
      title: mockUser.title,
      bio: mockUser.bio,
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset form and exit edit mode
    setFormData({
      fullName: mockUser.fullName,
      email: mockUser.email,
      title: mockUser.title,
      bio: mockUser.bio,
    })
    setIsEditing(false)
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setIsLoading(true)
    setShowSuccess(false)

    // TODO: Replace with actual API call
    console.log('Updating profile:', formData)

    // Simulate API call
    setTimeout(() => {
      // updateUser(formData) // TODO: Call AuthContext updateUser
      setIsLoading(false)
      setIsEditing(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    }, 1000)
  }

  return (
    <div className="max-w-2xl mx-auto">
      <div className="flex items-center justify-between mb-8">
        <h1 className="text-3xl font-bold text-gray-900">Profile Settings</h1>
        {!isEditing && (
          <Button onClick={handleEdit} variant="outline">
            <Edit2 className="w-4 h-4 mr-2" />
            Edit Profile
          </Button>
        )}
      </div>

      {/* Success Message */}
      {showSuccess && (
        <div className="mb-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
          <CheckCircle className="w-5 h-5 text-green-600" />
          <p className="text-sm font-medium text-green-800">
            Profile updated successfully!
          </p>
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <Card>
          <CardContent className="p-8 space-y-8">
            {/* Avatar Section */}
            <div className="flex items-center gap-6">
              <div className="relative">
                {mockUser.avatar ? (
                  <img
                    src={mockUser.avatar}
                    alt={mockUser.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md">
                    {mockUser.fullName.charAt(0)}
                  </div>
                )}
                {isEditing && (
                  <button
                    type="button"
                    className="absolute bottom-0 right-0 bg-white rounded-full p-1.5 shadow-sm border border-gray-200 text-gray-600 hover:text-indigo-600 transition-colors"
                  >
                    <User className="w-4 h-4" />
                  </button>
                )}
              </div>
              <div>
                <h2 className="text-xl font-bold text-gray-900">
                  {mockUser.fullName}
                </h2>
                <p className="text-gray-500">{mockUser.email}</p>
              </div>
            </div>

            {/* View Mode */}
            {!isEditing ? (
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Full Name
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <User className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">
                        {mockUser.fullName || 'Not set'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{mockUser.email}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Job Title
                  </label>
                  <div className="flex items-center gap-2 text-gray-900">
                    <Briefcase className="w-4 h-4 text-gray-400" />
                    <span className="font-medium">
                      {mockUser.title || 'Not set'}
                    </span>
                  </div>
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-500 mb-2">
                    Bio
                  </label>
                  <div className="flex items-start gap-2 text-gray-900">
                    <FileText className="w-4 h-4 text-gray-400 mt-0.5" />
                    <p className="font-medium whitespace-pre-wrap leading-relaxed">
                      {mockUser.bio || 'No bio added yet'}
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              /* Edit Mode */
              <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Input
                    label="Full Name"
                    value={formData.fullName}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fullName: e.target.value,
                      })
                    }
                    icon={<User className="w-4 h-4" />}
                  />
                  <Input
                    label="Email"
                    value={formData.email}
                    disabled
                    className="bg-gray-50"
                    icon={<Mail className="w-4 h-4" />}
                  />
                </div>

                <Input
                  label="Job Title"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      title: e.target.value,
                    })
                  }
                  placeholder="e.g. Product Manager"
                  icon={<Briefcase className="w-4 h-4" />}
                />

                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1.5">
                    Bio
                  </label>
                  <div className="relative">
                    <div className="absolute left-3 top-3 text-gray-400">
                      <FileText className="w-4 h-4" />
                    </div>
                    <textarea
                      className="w-full min-h-[120px] rounded-lg border border-gray-300 bg-white pl-10 pr-3 py-2 text-sm placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent transition-shadow"
                      value={formData.bio}
                      onChange={(e) =>
                        setFormData({
                          ...formData,
                          bio: e.target.value,
                        })
                      }
                      placeholder="Tell us a bit about yourself..."
                    />
                  </div>
                </div>
              </div>
            )}

            {/* Action Buttons - Only show in edit mode */}
            {isEditing && (
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button type="button" variant="ghost" onClick={handleCancel}>
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" isLoading={isLoading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Save Changes
                </Button>
              </div>
            )}
          </CardContent>
        </Card>
      </form>
    </div>
  )
}

export default Profile
