import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { createMeeting } from '../services/meeting.api';
import { AttendingStatus } from '../types/meeting.types';

/**
 * New Meeting Page
 * 
 * Form to create a new meeting with participants
 */

function NewMeeting() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
    emails: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Convert comma-separated emails to array
      const emailArray = formData.emails
        .split(',')
        .map(e => e.trim())
        .filter(e => e.length > 0);

      const meetingData = {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        notes: formData.notes || undefined,
        emails: emailArray,
        status: AttendingStatus.PENDING,
      };

      await createMeeting(meetingData);
      alert('Meeting created successfully!');
      navigate('/home');
      
    } catch (err: any) {
      console.error('Create meeting error:', err);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to create meeting');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <Layout>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ margin: '0 0 1.5rem 0' }}>Create New Meeting</h1>

        <form onSubmit={handleSubmit} style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          display: 'flex',
          flexDirection: 'column',
          gap: '1.5rem'
        }}>
          {/* Basic Information Section */}
          <div>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.1rem',
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.5rem'
            }}>
              📋 Basic Information
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="title"><strong>Title *</strong></label>
              <input
                id="title"
                type="text"
                name="title"
                value={formData.title}
                onChange={handleChange}
                required
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          {/* Date & Time Section */}
          <div>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.1rem',
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.5rem'
            }}>
              🕐 Date & Time
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="startTime"><strong>Start Time *</strong></label>
                <input
                  id="startTime"
                  type="datetime-local"
                  name="startTime"
                  value={formData.startTime}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>

              <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                <label htmlFor="endTime"><strong>End Time *</strong></label>
                <input
                  id="endTime"
                  type="datetime-local"
                  name="endTime"
                  value={formData.endTime}
                  onChange={handleChange}
                  required
                  style={{
                    padding: '0.75rem',
                    fontSize: '1rem',
                    border: '1px solid #ccc',
                    borderRadius: '4px'
                  }}
                />
              </div>
            </div>
          </div>

          {/* Location Section */}
          <div>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.1rem',
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.5rem'
            }}>
              📍 Location
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="location"><strong>Meeting Location *</strong></label>
              <input
                id="location"
                type="text"
                name="location"
                value={formData.location}
                onChange={handleChange}
                required
                placeholder="e.g., Conference Room A, Zoom Link"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
            </div>
          </div>

          {/* Participants Section */}
          <div>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.1rem',
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.5rem'
            }}>
              👥 Participants
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="emails"><strong>Participant Emails</strong></label>
              <input
                id="emails"
                type="text"
                name="emails"
                value={formData.emails}
                onChange={handleChange}
                placeholder="email1@example.com, email2@example.com"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px'
                }}
              />
              <small style={{ color: '#7f8c8d' }}>Separate multiple emails with commas</small>
            </div>
          </div>

          {/* Additional Details Section */}
          <div>
            <h3 style={{ 
              margin: '0 0 1rem 0', 
              fontSize: '1.1rem',
              color: '#2c3e50',
              borderBottom: '2px solid #3498db',
              paddingBottom: '0.5rem'
            }}>
              📝 Additional Details
            </h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
              <label htmlFor="notes"><strong>Notes / Agenda</strong></label>
              <textarea
                id="notes"
                name="notes"
                value={formData.notes}
                onChange={handleChange}
                rows={4}
                placeholder="Optional meeting notes or agenda"
                style={{
                  padding: '0.75rem',
                  fontSize: '1rem',
                  border: '1px solid #ccc',
                  borderRadius: '4px',
                  fontFamily: 'inherit',
                  resize: 'vertical'
                }}
              />
            </div>
          </div>

          {error && (
            <div style={{
              color: '#e74c3c',
              padding: '0.75rem',
              background: '#ffeeee',
              borderRadius: '4px',
              fontSize: '0.9rem'
            }}>
              {error}
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              cursor: loading ? 'not-allowed' : 'pointer',
              border: 'none',
              background: loading ? '#95a5a6' : '#27ae60',
              color: 'white',
              borderRadius: '4px',
              marginTop: '0.5rem'
            }}
          >
            {loading ? 'Creating...' : 'Create Meeting'}
          </button>

          <button
            type="button"
            onClick={() => navigate('/home')}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              cursor: 'pointer',
              border: '1px solid #ccc',
              background: 'white',
              borderRadius: '4px'
            }}
          >
            Cancel
          </button>
        </form>
      </div>
    </Layout>
  );
}

export default NewMeeting;

