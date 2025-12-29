import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserMeetings, updateAttendanceStatus, deleteMeeting } from '../services/meeting.api';
import type { Meeting } from '../types/meeting.types';
import { AttendingStatus } from '../types/meeting.types';
import { useAuth } from '../context/AuthContext';

/**
 * Home Page - Displays all user meetings
 * 
 * Shows upcoming meetings sorted by date (soonest first)
 * User can update their attendance status for each meeting
 */

function Home() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeetings();
  }, []);

  const loadMeetings = async () => {
    try {
      setLoading(true);
      const data = await getUserMeetings();
      const now = new Date();
      
      // Filter upcoming meetings (haven't started yet) and sort by startTime (soonest first)
      const upcoming = data.filter(m => new Date(m.startTime) > now);
      const sorted = upcoming.sort((a, b) => 
        new Date(a.startTime).getTime() - new Date(b.startTime).getTime()
      );
      
      setMeetings(sorted);
    } catch (err: any) {
      console.error('Failed to load meetings:', err);
      setError('Failed to load meetings');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (meetingId: string, newStatus: AttendingStatus) => {
    try {
      await updateAttendanceStatus(meetingId, newStatus);
      // Reload meetings to get updated data
      await loadMeetings();
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async (meetingId: string, meetingTitle: string) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${meetingTitle}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await deleteMeeting(meetingId);
      alert('Meeting deleted successfully');
      await loadMeetings();
    } catch (err: any) {
      console.error('Failed to delete meeting:', err);
      alert('Failed to delete meeting: ' + (err.response?.data?.message || err.message));
    }
  };

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  const isOwner = (meeting: Meeting) => meeting.ownerId === user?.id;

  return (
    <Layout>
      <div>
        <h1 style={{ margin: '0 0 1.5rem 0' }}>My Upcoming Meetings</h1>

        {loading && <p>Loading meetings...</p>}
        {error && <p style={{ color: '#e74c3c' }}>{error}</p>}

        {!loading && meetings.length === 0 && (
          <p style={{ color: '#7f8c8d' }}>No upcoming meetings. Create one to get started!</p>
        )}

        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {meetings.map(meeting => (
            <div
              key={meeting.id}
              onClick={() => navigate(`/meeting/${meeting.id}`)}
              style={{
                background: 'white',
                padding: '1.5rem',
                borderRadius: '8px',
                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                cursor: 'pointer',
                transition: 'transform 0.2s, box-shadow 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.15)';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.1)';
              }}
            >
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'start', gap: '1rem' }}>
                <div style={{ flex: 1 }}>
                  <h3 style={{ margin: '0 0 0.5rem 0', fontSize: '1.25rem' }}>
                    {meeting.title}
                    {isOwner(meeting) && (
                      <span style={{
                        marginLeft: '0.75rem',
                        fontSize: '0.75rem',
                        background: '#3498db',
                        color: 'white',
                        padding: '0.25rem 0.5rem',
                        borderRadius: '4px'
                      }}>
                        Owner
                      </span>
                    )}
                  </h3>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', color: '#7f8c8d' }}>
                    <p style={{ margin: 0 }}>
                      <strong>📅 Start:</strong> {formatDateTime(meeting.startTime)}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>⏰ End:</strong> {formatDateTime(meeting.endTime)}
                    </p>
                    <p style={{ margin: 0 }}>
                      <strong>📍 Location:</strong> {meeting.location}
                    </p>
                    {meeting.notes && (
                      <p style={{ margin: 0 }}>
                        <strong>📝 Notes:</strong> {meeting.notes}
                      </p>
                    )}
                  </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', minWidth: '150px' }}>
                  {isOwner(meeting) ? (
                    // Owner actions: Edit and Delete
                    <>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          navigate(`/edit-meeting/${meeting.id}`);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          border: '1px solid #3498db',
                          background: '#3498db',
                          color: 'white',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        ✏️ Edit
                      </button>
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDelete(meeting.id, meeting.title);
                        }}
                        style={{
                          padding: '0.5rem 1rem',
                          fontSize: '0.9rem',
                          cursor: 'pointer',
                          border: '1px solid #e74c3c',
                          background: '#e74c3c',
                          color: 'white',
                          borderRadius: '4px',
                          display: 'flex',
                          alignItems: 'center',
                          justifyContent: 'center',
                          gap: '0.5rem'
                        }}
                      >
                        🗑️ Delete
                      </button>
                    </>
                  ) : (
                    // Participant actions: Update status
                    <>
                      <label style={{ fontSize: '0.85rem', fontWeight: 'bold' }}>Your Status:</label>
                      <select
                        onChange={(e) => {
                          e.stopPropagation();
                          handleStatusChange(meeting.id, e.target.value as typeof AttendingStatus[keyof typeof AttendingStatus]);
                        }}
                        onClick={(e) => e.stopPropagation()}
                        style={{
                          padding: '0.5rem',
                          borderRadius: '4px',
                          border: '1px solid #ccc',
                          fontSize: '0.9rem',
                          cursor: 'pointer'
                        }}
                      >
                        <option value={AttendingStatus.PENDING}>Pending</option>
                        <option value={AttendingStatus.CONFIRMED}>Confirmed</option>
                        <option value={AttendingStatus.DECLINED}>Declined</option>
                      </select>
                    </>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default Home;

