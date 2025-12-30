import { useState, useEffect } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import Layout from '../components/Layout';
import { getMeetingById, updateAttendanceStatus, deleteMeeting, getMeetingParticipants } from '../services/meeting.api';
import type { Meeting } from '../types/meeting.types';
import { AttendingStatus } from '../types/meeting.types';
import { useAuth } from '../context/AuthContext';

/**
 * Meeting Details Page
 * 
 * Shows full meeting information including:
 * - Meeting details
 * - Participant list with status management
 * - Google Maps location
 * - Smart status management UI
 */

interface Participant {
  id: string;
  userId: string;
  email: string;
  fullName: string;
  status: string;
  respondedAt: string | null;
}

function MeetingDetails() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  
  const [meeting, setMeeting] = useState<Meeting | null>(null);
  const [participants, setParticipants] = useState<Participant[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadMeetingDetails();
  }, [id]);

  const loadMeetingDetails = async () => {
    if (!id) return;

    try {
      setLoading(true);
      setError('');
      
      // Load meeting details and participants in parallel
      const [meetingData, participantsData] = await Promise.all([
        getMeetingById(id),
        getMeetingParticipants(id)
      ]);
      
      setMeeting(meetingData);
      setParticipants(participantsData);
      
    } catch (err: any) {
      console.error('Failed to load meeting:', err);
      setError(err.response?.data?.message || 'Failed to load meeting details');
    } finally {
      setLoading(false);
    }
  };

  const handleStatusChange = async (newStatus: string) => {
    if (!id) return;

    try {
      await updateAttendanceStatus(id, newStatus as typeof AttendingStatus[keyof typeof AttendingStatus]);
      await loadMeetingDetails();
      alert('Status updated successfully!');
    } catch (err: any) {
      console.error('Failed to update status:', err);
      alert('Failed to update status');
    }
  };

  const handleDelete = async () => {
    if (!id || !meeting) return;
    
    const confirmed = window.confirm(
      `Are you sure you want to delete "${meeting.title}"?\n\nThis action cannot be undone.`
    );
    
    if (!confirmed) return;

    try {
      await deleteMeeting(id);
      alert('Meeting deleted successfully');
      navigate('/home');
    } catch (err: any) {
      console.error('Failed to delete meeting:', err);
      alert('Failed to delete meeting');
    }
  };

  const getGoogleMapsSearchUrl = (location: string) => {
    return `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(location)}`;
  };

  const isOwner = meeting && meeting.ownerId === user?.id;

  if (loading) {
    return (
      <Layout>
        <div>
          <h1>Meeting Details</h1>
          <p>Loading...</p>
        </div>
      </Layout>
    );
  }

  if (error || !meeting) {
    return (
      <Layout>
        <div>
          <h1>Meeting Details</h1>
          <p style={{ color: '#e74c3c' }}>{error || 'Meeting not found'}</p>
          <button
            onClick={() => navigate('/home')}
            style={{
              padding: '0.75rem 1.5rem',
              fontSize: '1rem',
              cursor: 'pointer',
              border: '1px solid #ccc',
              background: 'white',
              borderRadius: '4px',
              marginTop: '1rem'
            }}
          >
            ← Back to Meetings
          </button>
        </div>
      </Layout>
    );
  }

  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map(n => n[0])
      .join('')
      .toUpperCase()
      .slice(0, 2);
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Back Button */}
        <button
          onClick={() => navigate('/home')}
          style={{
            padding: '0.5rem 1rem',
            fontSize: '0.9rem',
            cursor: 'pointer',
            border: 'none',
            background: 'transparent',
            color: '#3498db',
            marginBottom: '1rem',
            display: 'flex',
            alignItems: 'center',
            gap: '0.5rem'
          }}
        >
          ← Back to Meetings
        </button>

        {/* Meeting Header Card */}
        <div style={{
          background: 'white',
          padding: '2rem',
          borderRadius: '8px',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
          marginBottom: '1.5rem'
        }}>
          <div style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-start'
          }}>
            <div>
              <h1 style={{ margin: '0 0 1rem 0', fontSize: '2rem' }}>
                {meeting.title}
              </h1>
              
              <div style={{ 
                display: 'flex', 
                alignItems: 'center', 
                gap: '1rem',
                color: '#7f8c8d',
                fontSize: '1rem'
              }}>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  📅 {new Date(meeting.startTime).toLocaleDateString('en-US', { 
                    weekday: 'short',
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric'
                  })}
                </span>
                <span style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                  🕐 {new Date(meeting.startTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })} - {new Date(meeting.endTime).toLocaleTimeString('en-US', {
                    hour: 'numeric',
                    minute: '2-digit'
                  })}
                </span>
              </div>
            </div>

            {/* Action Buttons */}
            <div style={{ display: 'flex', gap: '0.75rem' }}>
              {!isOwner ? (
                // Participant: Accept/Decline buttons
                <>
                  <button
                    onClick={() => handleStatusChange(AttendingStatus.CONFIRMED)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#27ae60',
                      color: 'white',
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}
                  >
                    Accept
                  </button>
                  <button
                    onClick={() => handleStatusChange(AttendingStatus.DECLINED)}
                    style={{
                      padding: '0.75rem 1.5rem',
                      fontSize: '1rem',
                      cursor: 'pointer',
                      border: 'none',
                      background: '#e74c3c',
                      color: 'white',
                      borderRadius: '6px',
                      fontWeight: '600'
                    }}
                  >
                    Decline
                  </button>
                </>
              ) : (
                // Owner: Edit/Delete buttons
                <>
                  <button
                    onClick={() => navigate(`/edit-meeting/${id}`)}
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
                    ✏️ Edit
                  </button>
                  <button
                    onClick={handleDelete}
                    style={{
                      padding: '0.5rem 1rem',
                      fontSize: '0.9rem',
                      cursor: 'pointer',
                      border: '1px solid #e74c3c',
                      background: 'white',
                      color: '#e74c3c',
                      borderRadius: '4px'
                    }}
                  >
                    🗑️ Delete
                  </button>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Main Content - Two Column Layout */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.5fr 1fr',
          gap: '1.5rem'
        }}>
          {/* Left Column - Details */}
          <div>
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Details
              </h2>

              {/* Location */}
              <div style={{ marginBottom: '1.5rem' }}>
                <h3 style={{
                  fontSize: '0.9rem',
                  color: '#7f8c8d',
                  textTransform: 'uppercase',
                  letterSpacing: '0.5px',
                  marginBottom: '0.75rem',
                  fontWeight: '600'
                }}>
                  Location
                </h3>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                  <span style={{ fontSize: '1.1rem' }}>📍</span>
                  <span style={{ fontSize: '1rem' }}>{meeting.location}</span>
                </div>
                
                {/* Google Map Embed */}
                <div style={{ 
                  width: '100%', 
                  height: '250px', 
                  borderRadius: '8px',
                  overflow: 'hidden',
                  border: '1px solid #e0e0e0'
                }}>
                  <iframe
                    width="100%"
                    height="100%"
                    frameBorder="0"
                    style={{ border: 0 }}
                    src={`https://www.google.com/maps/embed/v1/place?key=AIzaSyBFw0Qbyq9zTFTd-tUY6dZWTgaQzuU17R8&q=${encodeURIComponent(meeting.location)}`}
                    allowFullScreen
                  />
                </div>
                <a
                  href={getGoogleMapsSearchUrl(meeting.location)}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-block',
                    marginTop: '0.75rem',
                    color: '#3498db',
                    textDecoration: 'none',
                    fontSize: '0.9rem'
                  }}
                >
                  View larger map →
                </a>
              </div>

              {/* Notes */}
              {meeting.notes && (
                <div>
                  <h3 style={{
                    fontSize: '0.9rem',
                    color: '#7f8c8d',
                    textTransform: 'uppercase',
                    letterSpacing: '0.5px',
                    marginBottom: '0.75rem',
                    fontWeight: '600'
                  }}>
                    Notes
                  </h3>
                  <p style={{ 
                    margin: 0, 
                    whiteSpace: 'pre-wrap', 
                    color: '#2c3e50',
                    lineHeight: '1.6'
                  }}>
                    {meeting.notes}
                  </p>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - Participants & Organizer */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem' }}>
            {/* Participants */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Participants {participants.length > 0 && `(${participants.length})`}
              </h2>
              
              {loading ? (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic', margin: 0 }}>
                  Loading participants...
                </p>
              ) : participants.length === 0 ? (
                <p style={{ color: '#7f8c8d', fontStyle: 'italic', margin: 0 }}>
                  No participants yet
                </p>
              ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                  {participants.map((participant) => (
                    <div
                      key={participant.id}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '1rem'
                      }}
                    >
                      <div style={{
                        width: '40px',
                        height: '40px',
                        borderRadius: '50%',
                        background: '#3498db',
                        color: 'white',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontWeight: '600',
                        fontSize: '1rem',
                        flexShrink: 0
                      }}>
                        {getInitials(participant.fullName)}
                      </div>
                      <div style={{ flex: 1, minWidth: 0 }}>
                        <div style={{ 
                          fontWeight: '600',
                          marginBottom: '0.25rem',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {participant.fullName}
                        </div>
                        <div style={{ 
                          fontSize: '0.85rem', 
                          color: '#7f8c8d',
                          overflow: 'hidden',
                          textOverflow: 'ellipsis',
                          whiteSpace: 'nowrap'
                        }}>
                          {participant.email}
                        </div>
                      </div>
                      <span style={{
                        padding: '0.35rem 0.75rem',
                        borderRadius: '4px',
                        fontSize: '0.85rem',
                        fontWeight: '600',
                        background: participant.status === 'confirmed' ? '#d5f4e6' :
                                   participant.status === 'declined' ? '#ffe0db' : '#fff3cd',
                        color: participant.status === 'confirmed' ? '#27ae60' :
                               participant.status === 'declined' ? '#e74c3c' : '#f39c12',
                        flexShrink: 0
                      }}>
                        {participant.status === 'confirmed' && 'Confirmed'}
                        {participant.status === 'declined' && 'Declined'}
                        {participant.status === 'pending' && 'Pending'}
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Organizer */}
            <div style={{
              background: 'white',
              padding: '2rem',
              borderRadius: '8px',
              boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
            }}>
              <h2 style={{ 
                margin: '0 0 1.5rem 0', 
                fontSize: '1.5rem',
                fontWeight: '600'
              }}>
                Organizer
              </h2>
              
              <div style={{
                display: 'flex',
                alignItems: 'center',
                gap: '1rem'
              }}>
                <div style={{
                  width: '48px',
                  height: '48px',
                  borderRadius: '50%',
                  background: '#3498db',
                  color: 'white',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  fontWeight: '600',
                  fontSize: '1.2rem'
                }}>
                  {user && getInitials(user.fullName)}
                </div>
                <div>
                  <div style={{ fontWeight: '600', marginBottom: '0.25rem' }}>
                    {user?.fullName || 'Meeting Owner'}
                  </div>
                  <div style={{ fontSize: '0.9rem', color: '#7f8c8d' }}>
                    {user?.email || ''}
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

      </div>
    </Layout>
  );
}

export default MeetingDetails;

