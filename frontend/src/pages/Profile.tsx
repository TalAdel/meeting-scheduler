import { useState, useEffect } from 'react';
import Layout from '../components/Layout';
import { useAuth } from '../context/AuthContext';
import { updateProfile } from '../services/user.api';
import { changePassword } from '../services/auth.api';

/**
 * Profile Page
 * 
 * View and edit user profile information
 * Connected to backend API
 */

function Profile() {
  const { user, login } = useAuth();
  
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    email: user?.email || '',
  });
  const [passwordData, setPasswordData] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });
  const [loading, setLoading] = useState(false);
  const [passwordLoading, setPasswordLoading] = useState(false);
  const [error, setError] = useState('');
  const [passwordError, setPasswordError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [showPasswordSection, setShowPasswordSection] = useState(false);

  useEffect(() => {
    if (user) {
      setFormData({
        fullName: user.fullName,
        email: user.email,
      });
    }
  }, [user]);

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'long',
      day: 'numeric',
      year: 'numeric'
    });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
    if (successMessage) setSuccessMessage('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccessMessage('');
    setLoading(true);

    try {
      // Only send changed fields
      const updates: { fullName?: string; email?: string } = {};
      
      if (formData.fullName !== user?.fullName) {
        updates.fullName = formData.fullName;
      }
      if (formData.email !== user?.email) {
        updates.email = formData.email;
      }

      // If nothing changed, just exit edit mode
      if (Object.keys(updates).length === 0) {
        setIsEditing(false);
        setSuccessMessage('No changes to save');
        return;
      }

      const updatedUser = await updateProfile(updates);
      
      // Update auth context with new user data
      if (user) {
        login({
          ...user,
          ...updatedUser
        }, localStorage.getItem('token') || '');
      }
      
      setIsEditing(false);
      setSuccessMessage('Profile updated successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err: any) {
      console.error('Update profile error:', err);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to update profile');
      }
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      email: user?.email || '',
    });
    setIsEditing(false);
    setError('');
    setSuccessMessage('');
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPasswordData({
      ...passwordData,
      [e.target.name]: e.target.value,
    });
    if (passwordError) setPasswordError('');
  };

  const handlePasswordSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setPasswordError('');
    
    // Validate passwords match
    if (passwordData.newPassword !== passwordData.confirmPassword) {
      setPasswordError('New passwords do not match');
      return;
    }

    // Validate password requirements
    if (passwordData.newPassword.length < 8) {
      setPasswordError('Password must be at least 8 characters long');
      return;
    }
    if (!/[A-Z]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one uppercase letter');
      return;
    }
    if (!/[0-9]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one number');
      return;
    }
    if (!/[!@#$%^&*(),.?":{}|<>]/.test(passwordData.newPassword)) {
      setPasswordError('Password must contain at least one special character');
      return;
    }

    setPasswordLoading(true);

    try {
      await changePassword(passwordData.currentPassword, passwordData.newPassword);
      
      // Reset form
      setPasswordData({
        currentPassword: '',
        newPassword: '',
        confirmPassword: '',
      });
      setShowPasswordSection(false);
      setSuccessMessage('Password changed successfully!');
      
      // Clear success message after 3 seconds
      setTimeout(() => setSuccessMessage(''), 3000);
      
    } catch (err: any) {
      console.error('Change password error:', err);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setPasswordError(errorMessages);
      } else if (err.response?.data?.message) {
        setPasswordError(err.response.data.message);
      } else {
        setPasswordError(err.message || 'Failed to change password');
      }
    } finally {
      setPasswordLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '700px' }}>
        <div style={{ 
          display: 'flex', 
          justifyContent: 'space-between', 
          alignItems: 'center',
          marginBottom: '1.5rem'
        }}>
          <h1 style={{ margin: 0 }}>Profile</h1>
          
          {!isEditing && (
            <button
              onClick={() => setIsEditing(true)}
              style={{
                padding: '0.75rem 1.5rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none',
                background: '#3498db',
                color: 'white',
                borderRadius: '6px',
                fontWeight: '600'
              }}
            >
              ✏️ Edit Profile
            </button>
          )}
        </div>

        {/* Success Message */}
        {successMessage && (
          <div style={{
            padding: '1rem',
            background: '#d5f4e6',
            color: '#27ae60',
            borderRadius: '6px',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem',
            animation: 'fadeIn 0.3s'
          }}>
            <span style={{ fontSize: '1.25rem' }}>✓</span>
            <span style={{ fontWeight: '600' }}>{successMessage}</span>
          </div>
        )}

        {/* Error Message */}
        {error && (
          <div style={{
            padding: '1rem',
            background: '#ffe0db',
            color: '#e74c3c',
            borderRadius: '6px',
            marginBottom: '1rem'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{
            background: 'white',
            padding: '2rem',
            borderRadius: '8px',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
            display: 'flex',
            flexDirection: 'column',
            gap: '1.5rem'
          }}>
            {/* Avatar Section */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '1.5rem' }}>
              <div style={{
                width: '80px',
                height: '80px',
                borderRadius: '50%',
                background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
                color: 'white',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                fontWeight: '700',
                boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
              }}>
                {user?.fullName?.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2)}
              </div>
              <div>
                <h2 style={{ margin: '0 0 0.25rem 0', fontSize: '1.5rem' }}>
                  {user?.fullName}
                </h2>
                <p style={{ margin: 0, color: '#7f8c8d' }}>{user?.email}</p>
              </div>
            </div>

            {/* Full Name Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem', 
                color: '#7f8c8d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem',
                fontWeight: '600'
              }}>
                Full Name
              </label>
              {isEditing ? (
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>
                  {user?.fullName}
                </p>
              )}
            </div>

            {/* Email Field */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem', 
                color: '#7f8c8d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem',
                fontWeight: '600'
              }}>
                Email
              </label>
              {isEditing ? (
                <input
                  type="email"
                  name="email"
                  value={formData.email}
                  onChange={handleChange}
                  required
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '6px',
                    boxSizing: 'border-box'
                  }}
                />
              ) : (
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>
                  {user?.email}
                </p>
              )}
            </div>

            {/* User ID (Read-only) */}
            <div>
              <label style={{ 
                display: 'block', 
                fontSize: '0.85rem', 
                color: '#7f8c8d',
                textTransform: 'uppercase',
                letterSpacing: '0.5px',
                marginBottom: '0.75rem',
                fontWeight: '600'
              }}>
                User ID
              </label>
              <p style={{ 
                margin: 0, 
                fontSize: '0.9rem', 
                fontFamily: 'monospace',
                color: '#7f8c8d',
                background: '#f8f9fa',
                padding: '0.5rem',
                borderRadius: '4px'
              }}>
                {user?.id}
              </p>
            </div>

            {/* Member Since (Read-only) */}
            {user?.createdAt && (
              <div>
                <label style={{ 
                  display: 'block', 
                  fontSize: '0.85rem', 
                  color: '#7f8c8d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem',
                  fontWeight: '600'
                }}>
                  Member Since
                </label>
                <p style={{ margin: 0, fontSize: '1.1rem', color: '#2c3e50' }}>
                  {formatDate(user.createdAt)}
                </p>
              </div>
            )}

            {/* Action Buttons */}
            {isEditing && (
              <div style={{ 
                display: 'flex', 
                gap: '1rem', 
                marginTop: '1rem',
                paddingTop: '1rem',
                borderTop: '1px solid #e0e0e0'
              }}>
                <button
                  type="submit"
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    border: 'none',
                    background: loading ? '#95a5a6' : '#27ae60',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  {loading ? 'Saving...' : '✓ Save Changes'}
                </button>
                <button
                  type="button"
                  onClick={handleCancel}
                  disabled={loading}
                  style={{
                    flex: 1,
                    padding: '0.75rem',
                    fontSize: '1rem',
                    cursor: loading ? 'not-allowed' : 'pointer',
                    border: '1px solid #ccc',
                    background: 'white',
                    color: '#7f8c8d',
                    borderRadius: '6px',
                    fontWeight: '600'
                  }}
                >
                  Cancel
                </button>
              </div>
            )}
          </div>
        </form>

        {/* Change Password Section */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginTop: '1.5rem'
        }}>
          <div style={{ 
            display: 'flex', 
            justifyContent: 'space-between', 
            alignItems: 'center',
            marginBottom: showPasswordSection ? '1.5rem' : 0
          }}>
            <h2 style={{ margin: 0, fontSize: '1.25rem' }}>🔒 Change Password</h2>
            <button
              onClick={() => {
                setShowPasswordSection(!showPasswordSection);
                setPasswordError('');
                setPasswordData({
                  currentPassword: '',
                  newPassword: '',
                  confirmPassword: '',
                });
              }}
              style={{
                padding: '0.5rem 1rem',
                fontSize: '0.9rem',
                cursor: 'pointer',
                border: '1px solid #3498db',
                background: 'white',
                color: '#3498db',
                borderRadius: '4px'
              }}
            >
              {showPasswordSection ? 'Cancel' : 'Change Password'}
            </button>
          </div>

          {showPasswordSection && (
            <form onSubmit={handlePasswordSubmit}>
              <div style={{ 
                display: 'flex', 
                flexDirection: 'column', 
                gap: '1.25rem',
                marginTop: '1rem'
              }}>
                {/* Password Error */}
                {passwordError && (
                  <div style={{
                    padding: '1rem',
                    background: '#ffe0db',
                    color: '#e74c3c',
                    borderRadius: '6px'
                  }}>
                    {passwordError}
                  </div>
                )}

                {/* Current Password */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    color: '#7f8c8d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Current Password *
                  </label>
                  <input
                    type="password"
                    name="currentPassword"
                    value={passwordData.currentPassword}
                    onChange={handlePasswordChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* New Password */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    color: '#7f8c8d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '0.75rem',
                    fontWeight: '600'
                  }}>
                    New Password *
                  </label>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordData.newPassword}
                    onChange={handlePasswordChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                  <small style={{ 
                    display: 'block',
                    marginTop: '0.5rem',
                    color: '#7f8c8d',
                    fontSize: '0.85rem'
                  }}>
                    Must be 8+ characters with uppercase, number, and special character
                  </small>
                </div>

                {/* Confirm Password */}
                <div>
                  <label style={{ 
                    display: 'block', 
                    fontSize: '0.85rem', 
                    color: '#7f8c8d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Confirm New Password *
                  </label>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordData.confirmPassword}
                    onChange={handlePasswordChange}
                    required
                    style={{
                      width: '100%',
                      padding: '0.75rem',
                      fontSize: '1rem',
                      border: '1px solid #ccc',
                      borderRadius: '6px',
                      boxSizing: 'border-box'
                    }}
                  />
                </div>

                {/* Submit Button */}
                <button
                  type="submit"
                  disabled={passwordLoading}
                  style={{
                    padding: '0.75rem',
                    fontSize: '1rem',
                    cursor: passwordLoading ? 'not-allowed' : 'pointer',
                    border: 'none',
                    background: passwordLoading ? '#95a5a6' : '#e74c3c',
                    color: 'white',
                    borderRadius: '6px',
                    fontWeight: '600',
                    marginTop: '0.5rem'
                  }}
                >
                  {passwordLoading ? 'Changing Password...' : '🔒 Change Password'}
                </button>
              </div>
            </form>
          )}
        </div>
      </div>
    </Layout>
  );
}

export default Profile;


