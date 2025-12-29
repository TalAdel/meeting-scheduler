import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Layout from '../components/Layout';
import { getUserMeetings } from '../services/meeting.api';
import type { Meeting } from '../types/meeting.types';
import { useAuth } from '../context/AuthContext';

/**
 * History Page - Shows all past meetings
 * 
 * Displays meetings that have already ended, sorted by most recent first
 */

function History() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [meetings, setMeetings] = useState<Meeting[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    loadHistoryMeetings();
  }, []);

  const loadHistoryMeetings = async () => {
    try {
      setLoading(true);
      const data = await getUserMeetings();
      const now = new Date();
      
      // Filter meetings that have already started (past meetings)
      const past = data.filter(m => new Date(m.startTime) < now);
      
      // Sort by startTime descending (most recent meetings that happened at the top)
      const sorted = past.sort((a, b) => 
        new Date(b.startTime).getTime() - new Date(a.startTime).getTime()
      );
      
      setMeetings(sorted);
    } catch (err: any) {
      console.error('Failed to load history:', err);
      setError('Failed to load meeting history');
    } finally {
      setLoading(false);
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
        <h1 style={{ margin: '0 0 1.5rem 0' }}>Meeting History</h1>

        {loading && <p>Loading history...</p>}
        {error && <p style={{ color: '#e74c3c' }}>{error}</p>}

        {!loading && meetings.length === 0 && (
          <p style={{ color: '#7f8c8d' }}>No past meetings yet.</p>
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
                opacity: 0.85,
                cursor: 'pointer',
                transition: 'transform 0.2s, opacity 0.2s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.transform = 'translateY(-2px)';
                e.currentTarget.style.opacity = '1';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.transform = 'translateY(0)';
                e.currentTarget.style.opacity = '0.85';
              }}
            >
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
                <span style={{
                  marginLeft: '0.75rem',
                  fontSize: '0.75rem',
                  background: new Date(meeting.endTime) < new Date() ? '#95a5a6' : '#f39c12',
                  color: 'white',
                  padding: '0.25rem 0.5rem',
                  borderRadius: '4px'
                }}>
                  {new Date(meeting.endTime) < new Date() ? 'Completed' : 'In Progress'}
                </span>
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
          ))}
        </div>
      </div>
    </Layout>
  );
}

export default History;

