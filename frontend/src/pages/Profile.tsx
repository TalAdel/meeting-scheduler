import { useState, useEffect } from 'react'
import { useAuth } from '../context/AuthContext'
import { Button } from '../components/ui/Button'
import { Input } from '../components/ui/Input'
import { Card, CardContent, CardHeader } from '../components/ui/Card'
import {
  User,
  Mail,
  Briefcase,
  FileText,
  CheckCircle,
  Edit2,
  X,
  Lock,
  Key,
} from 'lucide-react'
import { getUserProfile, updateProfile } from '../services/user.api'
import { changePassword } from '../services/auth.api'
import type { UpdateProfileData } from '../services/user.api'
import { validateProfileUpdate, validatePasswordChange } from '../utils/validation.utils'

/**
 * ProfilePage - NOW CONNECTED TO BACKEND!
 * 
 * Backend Integration:
 * - GET /api/v1/users/profile - Fetch user profile
 * - PUT /api/v1/users/profile - Update profile (partial updates)
 * - Updates AuthContext with new user data
 */

function Profile() {
  const { user, login, token } = useAuth()
  const [isLoading, setIsLoading] = useState(false)
  const [isFetching, setIsFetching] = useState(false)
  const [showSuccess, setShowSuccess] = useState(false)
  const [isEditing, setIsEditing] = useState(false)
  const [error, setError] = useState<string>('')
  
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
    title: user?.title || '',
    bio: user?.bio || '',
  })

  // Password change state
  const [isChangingPassword, setIsChangingPassword] = useState(false)
  const [passwordLoading, setPasswordLoading] = useState(false)
  const [passwordSuccess, setPasswordSuccess] = useState(false)
  const [passwordError, setPasswordError] = useState<string>('')
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  })

  // Fetch user profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      try {
        setIsFetching(true)
        const userData = await getUserProfile()
        
        // Update form data
        setFormData({
          fullName: userData.fullName,
          email: userData.email,
          title: userData.title || '',
          bio: userData.bio || '',
        })
        
        // Update auth context if needed
        if (token) {
          login(userData, token)
        }
      } catch (err: any) {
        console.error('Error fetching profile:', err)
        setError(err.response?.data?.message || 'Failed to load profile')
      } finally {
        setIsFetching(false)
      }
    }

    fetchProfile()
  }, [])

  const handleEdit = () => {
    // Reset form data when entering edit mode
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      title: user?.title || '',
      bio: user?.bio || '',
    })
    setIsEditing(true)
  }

  const handleCancel = () => {
    // Reset form and exit edit mode
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
      title: user?.title || '',
      bio: user?.bio || '',
    })
    setIsEditing(false)
    setError('')
  }

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setPasswordError('')
    setPasswordSuccess(false)

    // ✅ FRONTEND VALIDATION - Using elegant validation utilities!
    const validation = validatePasswordChange(
      passwordData.currentPassword,
      passwordData.newPassword,
      passwordData.confirmPassword
    )

    if (!validation.isValid) {
      setPasswordError(validation.error || 'Validation failed')
      return
    }

    setPasswordLoading(true)

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword)
      
      // Success!
      setPasswordSuccess(true)
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      })
      setIsChangingPassword(false)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setPasswordSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error changing password:', err)
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors
          .map((e: any) => e.msg)
          .join('\n')
        setPasswordError(errorMessages)
      } else if (err.response?.data?.message) {
        setPasswordError(err.response.data.message)
      } else {
        setPasswordError('Failed to change password')
      }
    } finally {
      setPasswordLoading(false)
    }
  }

  const handleCancelPasswordChange = () => {
    setIsChangingPassword(false)
    setPasswordError('')
    setPasswordData({
      currentPassword: '',
      newPassword: '',
      confirmPassword: '',
    })
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setShowSuccess(false)

    // ✅ FRONTEND VALIDATION - Using elegant validation utilities!
    const validation = validateProfileUpdate(formData, {
      fullName: user?.fullName,
      title: user?.title,
      bio: user?.bio,
    })

    if (!validation.isValid) {
      setError(validation.error || 'Validation failed')
      return
    }

    setIsLoading(true)

    try {
      // Prepare updates (only changed fields)
      const updates: UpdateProfileData = {}
      
      if (formData.fullName !== user?.fullName) {
        updates.fullName = formData.fullName.trim()
      }
      
      // Note: Backend might not support title and bio yet
      // You'll need to add these to the backend API
      
      const updatedUser = await updateProfile(updates)
      
      // Update auth context
      if (token) {
        login(updatedUser, token)
      }
      
      setIsEditing(false)
      setShowSuccess(true)

      // Hide success message after 3 seconds
      setTimeout(() => {
        setShowSuccess(false)
      }, 3000)
    } catch (err: any) {
      console.error('Error updating profile:', err)
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors
          .map((e: any) => e.msg)
          .join('\n')
        setError(errorMessages)
      } else if (err.response?.data?.message) {
        setError(err.response.data.message)
      } else {
        setError('Failed to update profile')
      }
    } finally {
      setIsLoading(false)
    }
  }

  // Loading state
  if (isFetching) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-indigo-600 border-t-transparent rounded-full animate-spin mx-auto mb-4"></div>
          <p className="text-gray-600">Loading profile...</p>
        </div>
      </div>
    )
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
                {user?.avatar ? (
                  <img
                    src={user.avatar}
                    alt={user.fullName}
                    className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                  />
                ) : (
                  <div className="w-24 h-24 bg-indigo-100 rounded-full flex items-center justify-center text-indigo-600 text-3xl font-bold border-4 border-white shadow-md">
                    {user?.fullName?.charAt(0) || 'U'}
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
                  {user?.fullName}
                </h2>
                <p className="text-gray-500">{user?.email}</p>
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
                        {user?.fullName || 'Not set'}
                      </span>
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-500 mb-2">
                      Email
                    </label>
                    <div className="flex items-center gap-2 text-gray-900">
                      <Mail className="w-4 h-4 text-gray-400" />
                      <span className="font-medium">{user?.email}</span>
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
                      {user?.title || 'Not set'}
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
                      {user?.bio || 'No bio added yet'}
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
                    required
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

                {/* Error Display */}
                {error && (
                  <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 whitespace-pre-line">
                    {error}
                  </div>
                )}
              </div>
            )}

            {/* Action Buttons - Only show in edit mode */}
            {isEditing && (
              <div className="pt-4 flex items-center justify-end gap-3">
                <Button 
                  type="button" 
                  variant="ghost" 
                  onClick={handleCancel}
                  disabled={isLoading}
                >
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

      {/* Change Password Section */}
      <Card className="mt-6">
        <CardHeader>
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-lg font-semibold text-gray-900">Security</h2>
              <p className="text-sm text-gray-500 mt-1">
                Update your password to keep your account secure
              </p>
            </div>
            {!isChangingPassword && (
              <Button onClick={() => setIsChangingPassword(true)} variant="outline">
                <Key className="w-4 h-4 mr-2" />
                Change Password
              </Button>
            )}
          </div>
        </CardHeader>

        {/* Password Success Message */}
        {passwordSuccess && (
          <div className="mx-6 mt-6 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center gap-3 animate-in fade-in slide-in-from-top-2 duration-300">
            <CheckCircle className="w-5 h-5 text-green-600" />
            <p className="text-sm font-medium text-green-800">
              Password changed successfully!
            </p>
          </div>
        )}

        {isChangingPassword && (
          <form onSubmit={handlePasswordSubmit}>
            <CardContent className="space-y-6">
              <Input
                label="Current Password"
                type="password"
                placeholder="••••••••"
                value={passwordData.currentPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    currentPassword: e.target.value,
                  })
                }
                required
                icon={<Lock className="w-4 h-4" />}
              />

              <Input
                label="New Password"
                type="password"
                placeholder="••••••••"
                value={passwordData.newPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    newPassword: e.target.value,
                  })
                }
                required
                minLength={8}
                icon={<Key className="w-4 h-4" />}
              />

              <Input
                label="Confirm New Password"
                type="password"
                placeholder="••••••••"
                value={passwordData.confirmPassword}
                onChange={(e) =>
                  setPasswordData({
                    ...passwordData,
                    confirmPassword: e.target.value,
                  })
                }
                required
                minLength={8}
                icon={<Key className="w-4 h-4" />}
              />

              {/* Password Error Display */}
              {passwordError && (
                <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-600 whitespace-pre-line">
                  {passwordError}
                </div>
              )}

              {/* Action Buttons */}
              <div className="pt-4 flex items-center justify-end gap-3 border-t border-gray-200">
                <Button
                  type="button"
                  variant="ghost"
                  onClick={handleCancelPasswordChange}
                  disabled={passwordLoading}
                >
                  <X className="w-4 h-4 mr-2" />
                  Cancel
                </Button>
                <Button type="submit" isLoading={passwordLoading}>
                  <CheckCircle className="w-4 h-4 mr-2" />
                  Change Password
                </Button>
              </div>
            </CardContent>
          </form>
        )}

        {!isChangingPassword && !passwordSuccess && (
          <CardContent>
            <p className="text-sm text-gray-500">
              Use a strong password with at least 8 characters, including numbers and special characters.
            </p>
          </CardContent>
        )}
      </Card>
    </div>
  )
}

export default Profile
