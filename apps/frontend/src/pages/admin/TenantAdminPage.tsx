/**
 * F1A Tenant Admin Portal - Main Admin Page
 * Platform administrator interface for tenant management
 * 
 * SECURITY COMPLIANCE:
 * - Platform admin access only (system.super_admin permission)
 * - No tenant switching capability
 * - Comprehensive security monitoring
 * - Audit trail integration
 */

import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import { useAuth } from '../../features/auth/store';
import { Card, CardContent, CardHeader, CardTitle } from '../../components/ui/card';
import { Alert, AlertDescription } from '../../components/ui/alert';
import { Badge } from '../../components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '../../components/ui/tabs';
import { AlertTriangle, Shield, Users, Building, Activity } from 'lucide-react';
import TenantListTable from '../../components/admin/TenantListTable';
import TenantForm from '../../components/admin/TenantForm';
import MembershipTable from '../../components/admin/MembershipTable';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';

// TypeScript interfaces for admin portal
interface TenantData {
  id: string;
  name: string;
  slug: string;
  billingEmail: string;
  defaultCurrency: string;
  timezone: string;
  status: 'ACTIVE' | 'SUSPENDED';
  createdAt: string;
  updatedAt: string;
  membershipCount: number;
}

interface MembershipData {
  id: string;
  userId: string;
  userEmail: string;
  userFirstName: string;
  userLastName: string;
  userDisplayName?: string;
  role: 'OWNER' | 'ADMIN' | 'STAFF' | 'VIEWER';
  createdAt: string;
}

interface TenantDetailData {
  tenant: TenantData;
  memberships: MembershipData[];
  stats: {
    totalUsers: number;
    activeUsers: number;
    totalQuotes: number;
    totalInvoices: number;
    totalRevenue: string;
  };
}

interface AdminHealthCheck {
  status: string;
  adminAccess: boolean;
  database: string;
  adminUserId: string;
  timestamp: string;
}

/**
 * TenantAdminPage Component
 * Main interface for platform administrators to manage tenants
 */
export const TenantAdminPage: React.FC = () => {
  const { user, isAuthenticated } = useAuth();
  const [selectedTenant, setSelectedTenant] = useState<TenantData | null>(null);
  const [tenantFormMode, setTenantFormMode] = useState<'create' | 'edit'>('create');
  const [isTenantFormOpen, setIsTenantFormOpen] = useState(false);

  // Admin access verification
  const { 
    data: adminHealth, 
    isLoading: isCheckingAccess, 
    error: accessError 
  } = useQuery({
    queryKey: ['admin', 'health'],
    queryFn: async (): Promise<AdminHealthCheck> => {
      const response = await apiClient.get('/v1/admin/health');
      return response.data;
    },
    retry: false, // Don't retry on permission errors
    staleTime: 60 * 1000, // 1 minute
  });

  // Fetch tenant details when a tenant is selected
  const { 
    data: tenantDetails, 
    isLoading: isLoadingDetails,
    refetch: refetchTenantDetails
  } = useQuery({
    queryKey: ['admin', 'tenants', 'detail', selectedTenant?.id],
    queryFn: async (): Promise<TenantDetailData> => {
      if (!selectedTenant?.id) throw new Error('No tenant selected');
      const response = await apiClient.get(`/v1/admin/tenants/${selectedTenant.id}`);
      return response.data;
    },
    enabled: !!selectedTenant?.id,
    staleTime: 30 * 1000, // 30 seconds
  });

  // Handle tenant form actions
  const handleCreateTenant = () => {
    setTenantFormMode('create');
    setSelectedTenant(null);
    setIsTenantFormOpen(true);
  };

  const handleEditTenant = (tenant: TenantData) => {
    setTenantFormMode('edit');
    setSelectedTenant(tenant);
    setIsTenantFormOpen(true);
  };

  const handleViewTenant = (tenant: TenantData) => {
    setSelectedTenant(tenant);
  };

  const handleCloseTenantForm = () => {
    setIsTenantFormOpen(false);
    setSelectedTenant(null);
  };

  const handleMembershipChange = () => {
    refetchTenantDetails();
  };

  // Security check - require authentication
  if (!isAuthenticated || !user) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert>
            <AlertTriangle className="h-4 w-4" />
            <AlertDescription>
              Authentication required to access the admin portal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  // Access verification loading
  if (isCheckingAccess) {
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center justify-center gap-2">
            <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
            <span>Verifying admin access...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  // Access denied
  if (accessError || !adminHealth?.adminAccess) {
    return (
      <Card>
        <CardContent className="p-6">
          <Alert variant="destructive">
            <Shield className="h-4 w-4" />
            <AlertDescription>
              Platform administrator access required. You do not have sufficient permissions to access the tenant admin portal.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      {/* Admin Portal Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Platform Admin Portal</h1>
          <p className="text-muted-foreground">
            Manage tenants and platform operations
          </p>
        </div>
        <div className="flex items-center gap-2">
          <Badge variant="outline" className="flex items-center gap-1">
            <Shield className="h-3 w-3" />
            Platform Admin
          </Badge>
          <Badge variant="secondary">
            {user.email}
          </Badge>
        </div>
      </div>

      {/* Admin Health Status */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Activity className="h-5 w-5" />
            System Status
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="flex items-center gap-2">
              <Badge variant={adminHealth.status === 'healthy' ? 'default' : 'destructive'}>
                {adminHealth.status}
              </Badge>
              <span className="text-sm">Portal Status</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant={adminHealth.database === 'connected' ? 'default' : 'destructive'}>
                {adminHealth.database}
              </Badge>
              <span className="text-sm">Database</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="outline">
                {new Date(adminHealth.timestamp).toLocaleTimeString()}
              </Badge>
              <span className="text-sm">Last Check</span>
            </div>
            <div className="flex items-center gap-2">
              <Badge variant="secondary">
                {adminHealth.adminUserId.substring(0, 8)}...
              </Badge>
              <span className="text-sm">Admin ID</span>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content Tabs */}
      <Tabs defaultValue="tenants" className="space-y-4">
        <TabsList>
          <TabsTrigger value="tenants" className="flex items-center gap-2">
            <Building className="h-4 w-4" />
            Tenants
          </TabsTrigger>
          <TabsTrigger value="tenant-detail" disabled={!selectedTenant}>
            <Users className="h-4 w-4" />
            {selectedTenant ? `${selectedTenant.name} Details` : 'Tenant Details'}
          </TabsTrigger>
        </TabsList>

        <TabsContent value="tenants">
          <TenantListTable
            onCreateTenant={handleCreateTenant}
            onEditTenant={handleEditTenant}
            onViewTenant={handleViewTenant}
          />
        </TabsContent>

        <TabsContent value="tenant-detail">
          {selectedTenant && tenantDetails ? (
            <div className="space-y-6">
              {/* Tenant Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <Building className="h-5 w-5" />
                    {tenantDetails.tenant.name}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Slug</div>
                      <div className="font-mono">{tenantDetails.tenant.slug}</div>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Status</div>
                      <Badge variant={tenantDetails.tenant.status === 'ACTIVE' ? 'default' : 'destructive'}>
                        {tenantDetails.tenant.status}
                      </Badge>
                    </div>
                    <div>
                      <div className="text-sm font-medium text-muted-foreground">Currency</div>
                      <div>{tenantDetails.tenant.defaultCurrency}</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Tenant Statistics */}
              <Card>
                <CardHeader>
                  <CardTitle>Tenant Statistics</CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tenantDetails.stats.totalUsers}</div>
                      <div className="text-sm text-muted-foreground">Total Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tenantDetails.stats.activeUsers}</div>
                      <div className="text-sm text-muted-foreground">Active Users</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tenantDetails.stats.totalQuotes}</div>
                      <div className="text-sm text-muted-foreground">Total Quotes</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">{tenantDetails.stats.totalInvoices}</div>
                      <div className="text-sm text-muted-foreground">Total Invoices</div>
                    </div>
                    <div className="text-center">
                      <div className="text-2xl font-bold">
                        {tenantDetails.tenant.defaultCurrency} {tenantDetails.stats.totalRevenue}
                      </div>
                      <div className="text-sm text-muted-foreground">Total Revenue</div>
                    </div>
                  </div>
                </CardContent>
              </Card>

              {/* Membership Management */}
              <MembershipTable
                tenantId={selectedTenant.id}
                tenantName={selectedTenant.name}
                memberships={tenantDetails.memberships}
                onMembershipChange={handleMembershipChange}
              />
            </div>
          ) : isLoadingDetails ? (
            <Card>
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-2">
                  <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-primary"></div>
                  <span>Loading tenant details...</span>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card>
              <CardContent className="p-6">
                <div className="text-center text-muted-foreground">
                  Select a tenant from the list to view details and manage memberships.
                </div>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>

      {/* Tenant Form Dialog */}
      <TenantForm
        isOpen={isTenantFormOpen}
        onClose={handleCloseTenantForm}
        tenant={tenantFormMode === 'edit' ? selectedTenant : null}
        mode={tenantFormMode}
      />
    </div>
  );
};

export default TenantAdminPage;
