import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMeetingById, updateMeeting } from '../services/meeting.api';

/**
 * Edit Meeting Page
 * 
 * Allows the owner to edit meeting details
 * Only accessible by the meeting owner
 */

function EditMeeting() {
  const navigate = useNavigate();
  const { id } = useParams<{ id: string }>();
  
  const [formData, setFormData] = useState({
    title: '',
    startTime: '',
    endTime: '',
    location: '',
    notes: '',
  });
  
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeeting();
  }, [id]);

  const loadMeeting = async () => {
    if (!id) {
      setError('Meeting ID is missing');
      setLoading(false);
      return;
    }

    try {
      setLoading(true);
      const meeting = await getMeetingById(id);
      
      // Convert ISO strings to datetime-local format
      const startTime = new Date(meeting.startTime).toISOString().slice(0, 16);
      const endTime = new Date(meeting.endTime).toISOString().slice(0, 16);
      
      setFormData({
        title: meeting.title,
        startTime,
        endTime,
        location: meeting.location,
        notes: meeting.notes || '',
      });
    } catch (err: any) {
      console.error('Failed to load meeting:', err);
      setError('Failed to load meeting: ' + (err.response?.data?.message || err.message));
    } finally {
      setLoading(false);
    }
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!id) return;
    
    setError('');
    setSaving(true);

    try {
      const updateData = {
        title: formData.title,
        startTime: formData.startTime,
        endTime: formData.endTime,
        location: formData.location,
        notes: formData.notes || undefined,
      };

      await updateMeeting(id, updateData);
      alert('Meeting updated successfully!');
      navigate('/home');
      
    } catch (err: any) {
      console.error('Update meeting error:', err);
      
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setError(errorMessages);
      } else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } else {
        setError(err.message || 'Failed to update meeting');
      }
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <Layout>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ margin: '0 0 1.5rem 0' }}>Edit Meeting</h1>
          <p>Loading meeting details...</p>
        </div>
      </Layout>
    );
  }

  if (error && !formData.title) {
    return (
      <Layout>
        <div style={{ maxWidth: '600px' }}>
          <h1 style={{ margin: '0 0 1.5rem 0' }}>Edit Meeting</h1>
          <div style={{ 
            color: '#e74c3c', 
            padding: '1rem', 
            background: '#ffeeee',
            borderRadius: '4px'
          }}>
            {error}
          </div>
          <button
            onClick={() => navigate('/home')}
            style={{
              marginTop: '1rem',
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              border: '1px solid #ccc',
              background: 'white',
              borderRadius: '4px'
            }}
          >
            ← Back to Meetings
          </button>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div style={{ maxWidth: '600px' }}>
        <h1 style={{ margin: '0 0 1.5rem 0' }}>Edit Meeting</h1>

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
            disabled={saving}
            style={{
              padding: '0.75rem',
              fontSize: '1rem',
              cursor: saving ? 'not-allowed' : 'pointer',
              border: 'none',
              background: saving ? '#95a5a6' : '#27ae60',
              color: 'white',
              borderRadius: '4px',
              marginTop: '0.5rem'
            }}
          >
            {saving ? 'Saving...' : 'Save Changes'}
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

export default EditMeeting;

