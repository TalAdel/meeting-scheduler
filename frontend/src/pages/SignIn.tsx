import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { signIn } from '../services/auth.api';
import { useAuth } from '../context/AuthContext';

/**
 * SignIn Component
 * 
 * Allows existing users to log in
 * After successful login, stores token and redirects to home
 */

function SignIn() {
  const navigate = useNavigate();
  const { login } = useAuth();
  
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  
  const [error, setError] = useState<string>('');
  const [loading, setLoading] = useState(false);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value,
    });
    // Clear error when user starts typing
    if (error) setError('');
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    console.log('Submitting form with data:', formData);

    try {
      const response = await signIn(formData);
      console.log('Login successful:', response);
      
      // Store user and token in context (and localStorage)
      login(response.user, response.token);
      
      // Redirect to home page
      navigate('/home');
      
    } catch (err: any) {
      console.error('Login error:', err);
      console.error('Error response:', err.response?.data);
      
      // Handle validation errors (array of errors)
      if (err.response?.data?.errors && Array.isArray(err.response.data.errors)) {
        const errorMessages = err.response.data.errors.map((e: any) => e.msg).join(', ');
        setError(errorMessages);
      } 
      // Handle single error message
      else if (err.response?.data?.message) {
        setError(err.response.data.message);
      } 
      // Fallback to generic error
      else {
        setError(err.message || 'Login failed');
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ 
      display: 'flex', 
      flexDirection: 'column', 
      alignItems: 'center', 
      justifyContent: 'center', 
      minHeight: '100vh',
      gap: '1rem',
      padding: '2rem'
    }}>
      <h1>Sign In</h1>
      
      <form onSubmit={handleSubmit} style={{
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem',
        width: '100%',
        maxWidth: '400px'
      }}>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
          <label htmlFor="email">Email</label>
          <input
            id="email"
            type="email"
            name="email"
            value={formData.email}
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
          <label htmlFor="password">Password</label>
          <input
            id="password"
            type="password"
            name="password"
            value={formData.password}
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

        {error && (
          <div style={{ 
            color: '#ff4444', 
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
            background: loading ? '#ccc' : '#646cff',
            color: 'white',
            borderRadius: '4px',
            marginTop: '0.5rem'
          }}
        >
          {loading ? 'Signing In...' : 'Sign In'}
        </button>
      </form>

      <div style={{ 
        display: 'flex', 
        gap: '1rem', 
        marginTop: '1rem',
        fontSize: '0.9rem'
      }}>
        <button 
          onClick={() => navigate('/signup')}
          style={{
            background: 'none',
            border: 'none',
            color: '#646cff',
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Don't have an account? Sign Up
        </button>
      </div>

      <button 
        onClick={() => navigate('/')}
        style={{
          background: 'none',
          border: '1px solid #ccc',
          padding: '0.5rem 1rem',
          borderRadius: '4px',
          cursor: 'pointer',
          marginTop: '1rem'
        }}
      >
        ← Back to Home
      </button>
    </div>
  );
}

export default SignIn;

