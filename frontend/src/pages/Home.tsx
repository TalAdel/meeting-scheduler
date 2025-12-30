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
  const [filteredMeetings, setFilteredMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  
  // Filter states
  const [statusFilter, setStatusFilter] = useState<string>('all');
  const [startDateFilter, setStartDateFilter] = useState<string>('');
  const [endDateFilter, setEndDateFilter] = useState<string>('');

  useEffect(() => {
    loadMeetings();
  }, []);

  // Apply filters whenever meetings or filter values change
  useEffect(() => {
    applyFilters();
  }, [meetings, statusFilter, startDateFilter, endDateFilter]);

  const applyFilters = () => {
    let filtered = [...meetings];

    // Filter by status
    if (statusFilter !== 'all') {
      filtered = filtered.filter(m => {
        // Owners don't have a status, so skip them for status filtering
        if (m.ownerId === user?.id) {
          return false; // Don't show owner meetings when filtering by status
        }
        return m.userStatus === statusFilter;
      });
    }

    // Filter by date range
    if (startDateFilter) {
      const startDate = new Date(startDateFilter);
      startDate.setHours(0, 0, 0, 0);
      filtered = filtered.filter(m => new Date(m.startTime) >= startDate);
    }

    if (endDateFilter) {
      const endDate = new Date(endDateFilter);
      endDate.setHours(23, 59, 59, 999);
      filtered = filtered.filter(m => new Date(m.startTime) <= endDate);
    }

    setFilteredMeetings(filtered);
  };

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
      minute: '2-digit',
      hour12: false // Use 24-hour format (17:00 instead of 05:00 PM)
    });
  };

  const isOwner = (meeting: Meeting) => meeting.ownerId === user?.id;

  const resetFilters = () => {
    setStatusFilter('all');
    setStartDateFilter('');
    setEndDateFilter('');
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <Layout>
      <div style={{ maxWidth: '1200px', margin: '0 auto' }}>
        {/* Welcome Section */}
        <div style={{
          background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
          padding: '2rem 2.5rem',
          borderRadius: '12px',
          marginBottom: '2rem',
          color: 'white',
          boxShadow: '0 4px 6px rgba(0,0,0,0.1)'
        }}>
          <h1 style={{ 
            margin: '0 0 0.5rem 0', 
            fontSize: '2rem',
            fontWeight: '600'
          }}>
            {getGreeting()}, {user?.fullName || 'User'}! 👋
          </h1>
          <p style={{ 
            margin: 0, 
            fontSize: '1.1rem',
            opacity: 0.95
          }}>
            You have {filteredMeetings.length} {filteredMeetings.length === 1 ? 'meeting' : 'meetings'} {statusFilter !== 'all' ? `with status "${statusFilter}"` : 'upcoming'}
          </p>
        </div>

        {/* Filter Bar */}
        <div style={{
          background: 'white',
          padding: '1.5rem',
          borderRadius: '8px',
          marginBottom: '1.5rem',
          boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
        }}>
          <div style={{
            display: 'flex',
            flexDirection: 'column',
            gap: '1rem'
          }}>
            <div style={{
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexWrap: 'wrap',
              gap: '1rem'
            }}>
              <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: '600' }}>
                🔍 Filter Meetings
              </h3>
              <button
                onClick={resetFilters}
                style={{
                  padding: '0.5rem 1rem',
                  fontSize: '0.9rem',
                  cursor: 'pointer',
                  border: '1px solid #e74c3c',
                  background: 'white',
                  color: '#e74c3c',
                  borderRadius: '6px',
                  fontWeight: '500',
                  transition: 'all 0.2s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = '#e74c3c';
                  e.currentTarget.style.color = 'white';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = 'white';
                  e.currentTarget.style.color = '#e74c3c';
                }}
              >
                🔄 Reset Filters
              </button>
            </div>

            <div style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '1rem'
            }}>
              {/* Status Filter */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  Status
                </label>
                <select
                  value={statusFilter}
                  onChange={(e) => setStatusFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '0.95rem',
                    cursor: 'pointer',
                    background: 'white'
                  }}
                >
                  <option value="all">All Statuses</option>
                  <option value="pending">⏳ Pending</option>
                  <option value="confirmed">✅ Confirmed</option>
                  <option value="declined">❌ Declined</option>
                </select>
              </div>

              {/* Start Date Filter */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  From Date
                </label>
                <input
                  type="date"
                  value={startDateFilter}
                  onChange={(e) => setStartDateFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                />
              </div>

              {/* End Date Filter */}
              <div>
                <label style={{
                  display: 'block',
                  marginBottom: '0.5rem',
                  fontSize: '0.9rem',
                  fontWeight: '600',
                  color: '#2c3e50'
                }}>
                  To Date
                </label>
                <input
                  type="date"
                  value={endDateFilter}
                  onChange={(e) => setEndDateFilter(e.target.value)}
                  style={{
                    width: '100%',
                    padding: '0.75rem',
                    borderRadius: '6px',
                    border: '1px solid #ddd',
                    fontSize: '0.95rem',
                    cursor: 'pointer'
                  }}
                />
              </div>
            </div>
          </div>
        </div>

        {/* Loading and Error States */}
        {loading && <p style={{ textAlign: 'center', color: '#7f8c8d' }}>Loading meetings...</p>}
        {error && <p style={{ color: '#e74c3c', textAlign: 'center' }}>{error}</p>}

        {/* Empty State */}
        {!loading && meetings.length === 0 && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#7f8c8d', fontSize: '1.1rem', margin: '0 0 1rem 0' }}>
              No upcoming meetings. Create one to get started!
            </p>
            <button
              onClick={() => navigate('/new-meeting')}
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
              ➕ Create Meeting
            </button>
          </div>
        )}

        {/* Filtered Empty State */}
        {!loading && meetings.length > 0 && filteredMeetings.length === 0 && (
          <div style={{
            background: 'white',
            padding: '3rem',
            borderRadius: '8px',
            textAlign: 'center',
            boxShadow: '0 2px 4px rgba(0,0,0,0.1)'
          }}>
            <p style={{ color: '#7f8c8d', fontSize: '1.1rem', margin: 0 }}>
              No meetings match your filters. Try adjusting your search criteria.
            </p>
          </div>
        )}

        {/* Meetings List */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
          {filteredMeetings.map(meeting => (
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
                        value={meeting.userStatus || AttendingStatus.PENDING}
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
                          cursor: 'pointer',
                          background: meeting.userStatus === 'confirmed' ? '#d5f4e6' :
                                     meeting.userStatus === 'declined' ? '#ffe0db' : 
                                     meeting.userStatus === 'pending' ? '#fff3cd' : 'white'
                        }}
                      >
                        <option value={AttendingStatus.PENDING}>⏳ Pending</option>
                        <option value={AttendingStatus.CONFIRMED}>✅ Confirmed</option>
                        <option value={AttendingStatus.DECLINED}>❌ Declined</option>
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

