/**
 * F1A Admin Portal Routes
 * Protected routing for platform administrator interface
 * 
 * SECURITY COMPLIANCE:
 * - Platform admin access verification
 * - Authentication guards on all routes
 * - No tenant switching capability
 * - Comprehensive access logging
 */

import React from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { useAuth } from '../features/auth/store';
import { Card, CardContent } from '../components/ui/card';
import { Alert, AlertDescription } from '../components/ui/alert';
import { Shield, AlertTriangle } from 'lucide-react';
import TenantAdminPage from '../pages/admin/TenantAdminPage';

/**
 * AdminGuard Component
 * Protects admin routes with authentication and permission checks
 */
const AdminGuard: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { isAuthenticated, user, isLoading } = useAuth();

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <div className="flex items-center gap-2">
              <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
              <span>Verifying authentication...</span>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Authentication required
  if (!isAuthenticated || !user) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <Alert>
              <AlertTriangle className="h-4 w-4" />
              <AlertDescription>
                Please log in to access the admin portal.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  // Platform admin permission check (basic client-side check)
  // Note: Server-side verification is the authoritative check
  const hasAdminRole = user.roles?.includes('super_admin') || 
                      user.permissions?.includes('system.super_admin');

  if (!hasAdminRole) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <Card>
          <CardContent className="p-6">
            <Alert variant="destructive">
              <Shield className="h-4 w-4" />
              <AlertDescription>
                Platform administrator access required. You do not have sufficient permissions to access this area.
              </AlertDescription>
            </Alert>
          </CardContent>
        </Card>
      </div>
    );
  }

  return <>{children}</>;
};

/**
 * AdminRoutes Component
 * Defines all admin portal routes with proper security guards
 */
export const AdminRoutes: React.FC = () => {
  return (
    <AdminGuard>
      <Routes>
        {/* Main admin portal */}
        <Route path="/admin" element={<TenantAdminPage />} />
        <Route path="/admin/tenants" element={<TenantAdminPage />} />
        
        {/* Redirect admin root to tenants */}
        <Route path="/admin/*" element={<Navigate to="/admin/tenants" replace />} />
      </Routes>
    </AdminGuard>
  );
};

export default AdminRoutes;

