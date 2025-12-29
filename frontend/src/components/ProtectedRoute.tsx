import { Navigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

/**
 * ProtectedRoute Component
 * 
 * WHY? This implements the Single Responsibility Principle
 * - ONE job: Check if user is authenticated
 * - If yes: show the children components
 * - If no: redirect to signin
 * 
 * ANALOGY: Like a bouncer at a club - checks your ID (token),
 * lets you in if valid, otherwise sends you to the entrance (signin)
 */

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



