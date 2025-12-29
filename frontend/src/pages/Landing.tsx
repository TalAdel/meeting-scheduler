import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useEffect } from 'react';

function Landing() {
  const navigate = useNavigate();
  const { isAuthenticated } = useAuth();

  // Redirect to home if already logged in
  useEffect(() => {
    if (isAuthenticated) {
      navigate('/home');
    }
  }, [isAuthenticated, navigate]);

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '2rem'
    }}>
      <h1>Meeting Scheduler</h1>
      
      {isAuthenticated ? (
        <>
          <p>Redirecting to home...</p>
        </>
      ) : (
        <>
          <p>Welcome to the Meeting Scheduler App</p>
          
          <div style={{ display: 'flex', gap: '1rem' }}>
            <button 
              onClick={() => navigate('/signin')}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: '1px solid #646cff',
                background: 'transparent',
                color: '#646cff',
                borderRadius: '4px'
              }}
            >
              Sign In
            </button>
            
            <button 
              onClick={() => navigate('/signup')}
              style={{
                padding: '0.75rem 2rem',
                fontSize: '1rem',
                cursor: 'pointer',
                border: 'none',
                background: '#646cff',
                color: 'white',
                borderRadius: '4px'
              }}
            >
              Sign Up
            </button>
          </div>
        </>
      )}
    </div>
  );
}

export default Landing;

