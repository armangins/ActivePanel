import { useState, useEffect, useRef } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '../../contexts/AuthContext';

const ProtectedRoute = ({ children }) => {
  const { isAuthenticated, loading } = useAuth();
  const [pendingAuthCheck, setPendingAuthCheck] = useState(false);
  const hasCheckedPendingAuth = useRef(false);

  // Handle grace period for state propagation after navigation
  // isAuthenticated already checks both state and cached localStorage token,
  // so we just need to wait for it to become true after loading completes
  useEffect(() => {
    // If loading just completed and we're not authenticated yet,
    // give it one render cycle for state to propagate
    if (!loading && !isAuthenticated && !hasCheckedPendingAuth.current) {
      hasCheckedPendingAuth.current = true;
      setPendingAuthCheck(true);
      
      // Reset after a brief delay to allow state to propagate
      const timeoutId = setTimeout(() => {
        setPendingAuthCheck(false);
        hasCheckedPendingAuth.current = false;
      }, 100);
      
      return () => clearTimeout(timeoutId);
    } else if (isAuthenticated) {
      // Reset when authenticated
      hasCheckedPendingAuth.current = false;
      setPendingAuthCheck(false);
    }
  }, [loading, isAuthenticated]);

  // Show loading state
  if (loading || pendingAuthCheck) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="text-right">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary-500 mx-auto"></div>
          <p className="mt-4 text-gray-600">טוען...</p>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return <Navigate to="/login" replace />;
  }

  // Render protected content
  return <>{children}</>;
};

export default ProtectedRoute;

