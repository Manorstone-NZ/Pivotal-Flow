import React, { useEffect } from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { useAuth } from './store';
import { SkeletonCard } from '../../components/ui/Skeleton';

interface RequireAuthProps {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

export const RequireAuth: React.FC<RequireAuthProps> = ({ 
  children, 
  fallback 
}) => {
  const location = useLocation();
  const { isAuthenticated, isLoading, checkAuthStatus } = useAuth();

  // Check auth status on mount
  useEffect(() => {
    console.log('🔒 RequireAuth: checkAuthStatus called for route:', location.pathname);
    checkAuthStatus();
  }, [checkAuthStatus]);

  // Show loading skeleton while checking authentication
  if (isLoading) {
    return fallback || (
      <div className="min-h-screen bg-surface-background p-8">
        <div className="max-w-4xl mx-auto space-y-6">
          <SkeletonCard />
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {Array.from({ length: 6 }).map((_, i) => (
              <SkeletonCard key={i} />
            ))}
          </div>
        </div>
      </div>
    );
  }

  // Redirect to login if not authenticated
  if (!isAuthenticated) {
    return (
      <Navigate 
        to="/login" 
        state={{ redirectTo: location.pathname + location.search }}
        replace 
      />
    );
  }

  // Render protected content
  return <>{children}</>;
};

// Higher-order component version for easier usage
export const withAuth = <P extends object>(
  Component: React.ComponentType<P>
) => {
  return (props: P) => (
    <RequireAuth>
      <Component {...props} />
    </RequireAuth>
  );
};
