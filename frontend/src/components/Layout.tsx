import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


interface LayoutProps {
  children: React.ReactNode;
}

function Layout({ children }: LayoutProps) {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, logout } = useAuth();

  const navItems = [
    { path: '/home', label: 'My Meetings', icon: '📅' },
    { path: '/new-meeting', label: 'New Meeting', icon: '➕' },
    { path: '/history', label: 'History', icon: '📚' },
    { path: '/profile', label: 'Profile', icon: '👤' },
  ];

  const isActive = (path: string) => location.pathname === path;

  return (
    <div style={{ display: 'flex', minHeight: '100vh' }}>
      {/* Sidebar */}
      <div style={{
        width: '250px',
        background: '#2c3e50',
        color: 'white',
        padding: '1.5rem',
        display: 'flex',
        flexDirection: 'column',
        gap: '1rem'
      }}>
        <div style={{ marginBottom: '2rem' }}>
          <h2 style={{ margin: 0, fontSize: '1.5rem' }}>Meeting App</h2>
          <p style={{ margin: '0.5rem 0 0 0', fontSize: '0.85rem', opacity: 0.8 }}>
            {user?.fullName}
          </p>
        </div>

        <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
          {navItems.map(item => (
            <button
              key={item.path}
              onClick={() => navigate(item.path)}
              style={{
                padding: '0.75rem 1rem',
                background: isActive(item.path) ? '#34495e' : 'transparent',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer',
                textAlign: 'left',
                fontSize: '1rem',
                display: 'flex',
                alignItems: 'center',
                gap: '0.75rem',
                transition: 'background 0.2s'
              }}
              onMouseEnter={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = '#34495e80';
                }
              }}
              onMouseLeave={(e) => {
                if (!isActive(item.path)) {
                  e.currentTarget.style.background = 'transparent';
                }
              }}
            >
              <span style={{ fontSize: '1.25rem' }}>{item.icon}</span>
              {item.label}
            </button>
          ))}
        </nav>

        <button
          onClick={() => {
            logout();
            navigate('/');
          }}
          style={{
            padding: '0.75rem 1rem',
            background: '#e74c3c',
            color: 'white',
            border: 'none',
            borderRadius: '4px',
            cursor: 'pointer',
            fontSize: '1rem'
          }}
        >
          Logout
        </button>
      </div>

      {/* Main Content */}
      <div style={{ flex: 1, padding: '2rem', background: '#ecf0f1', overflowY: 'auto' }}>
        {children}
      </div>
    </div>
  );
}

export default Layout;



