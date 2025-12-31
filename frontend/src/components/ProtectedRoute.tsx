import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';


interface ProtectedRouteProps {
  children: React.ReactNode;
}

function ProtectedRoute({ children }: ProtectedRouteProps) {
  const { isAuthenticated } = useAuth();

  if (!isAuthenticated) {
    // User not logged in, redirect to signin
    return <Navigate to="/signin" replace />;
  }

  // User is authenticated, show the protected content
  return <>{children}</>;
}

export default ProtectedRoute;



