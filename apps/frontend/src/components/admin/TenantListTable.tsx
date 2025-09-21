/**
 * F1A Tenant Admin Portal - Tenant List Table Component
 * Secure tenant management interface for platform administrators
 * 
 * SECURITY COMPLIANCE:
 * - Platform admin access only
 * - No tenant switching functionality
 * - Comprehensive audit trail integration
 * - TypeScript strict mode compliance
 */

import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { 
  Table, 
  TableBody, 
  TableCell, 
  TableHead, 
  TableHeader, 
  TableRow 
} from '../ui/table';
import { Button } from '../ui/button';
import { Input } from '../ui/input';
import { Badge } from '../ui/badge';
import { 
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '../ui/select';
import { 
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '../ui/alert-dialog';
import { Card, CardContent, CardHeader, CardTitle } from '../ui/card';
import { Search, Plus, Settings, Users, AlertTriangle } from 'lucide-react';
import { apiClient } from '../../lib/api-client';
import { logger } from '../../lib/logger';

// TypeScript interfaces for admin portal data
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

interface TenantListResponse {
  data: TenantData[];
  pagination: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
    hasNext: boolean;
    hasPrevious: boolean;
  };
  meta?: {
    searchQuery?: string;
    statusFilter?: string;
    sortBy?: string;
    sortOrder?: string;
  };
}

interface TenantListQuery {
  page?: number;
  limit?: number;
  search?: string;
  status?: 'ACTIVE' | 'SUSPENDED' | 'ALL';
  sortBy?: 'name' | 'createdAt' | 'membershipCount';
  sortOrder?: 'asc' | 'desc';
}

// React Query keys for admin portal
const adminQueryKeys = {
  tenants: {
    all: ['admin', 'tenants'] as const,
    list: (query: TenantListQuery) => [...adminQueryKeys.tenants.all, 'list', query] as const,
    detail: (id: string) => [...adminQueryKeys.tenants.all, 'detail', id] as const,
  }
};

interface TenantListTableProps {
  onCreateTenant: () => void;
  onEditTenant: (tenant: TenantData) => void;
  onViewTenant: (tenant: TenantData) => void;
}

/**
 * TenantListTable Component
 * Displays paginated list of tenants with search, filtering, and actions
 */
export const TenantListTable: React.FC<TenantListTableProps> = ({
  onCreateTenant,
  onEditTenant,
  onViewTenant
}) => {
  const [query, setQuery] = useState<TenantListQuery>({
    page: 1,
    limit: 20,
    search: '',
    status: 'ALL',
    sortBy: 'createdAt',
    sortOrder: 'desc'
  });
  
  const [suspendingTenant, setSuspendingTenant] = useState<TenantData | null>(null);
  const queryClient = useQueryClient();

  // Fetch tenants with React Query
  const { 
    data: tenantsResponse, 
    isLoading, 
    error 
  } = useQuery({
    queryKey: adminQueryKeys.tenants.list(query),
    queryFn: async (): Promise<TenantListResponse> => {
      const response = await apiClient.get('/v1/admin/tenants', { 
        params: query 
      });
      return response.data;
    },
    staleTime: 30 * 1000, // 30 seconds - admin data changes frequently
    retry: (failureCount, error: any) => {
      // Don't retry on permission errors
      if (error?.response?.status === 403) {
        return false;
      }
      return failureCount < 2;
    }
  });

  // Suspend/reactivate tenant mutation
  const suspendTenantMutation = useMutation({
    mutationFn: async ({ tenantId, status }: { tenantId: string; status: 'ACTIVE' | 'SUSPENDED' }) => {
      const response = await apiClient.patch(`/v1/admin/tenants/${tenantId}`, { status });
      return response.data;
    },
    onSuccess: () => {
      // F1.5 compliance: No optimistic updates - always show server truth
      queryClient.invalidateQueries({ queryKey: adminQueryKeys.tenants.all });
      setSuspendingTenant(null);
      
      logger.info('Tenant status updated successfully');
    },
    onError: (error: any) => {
      logger.error('Failed to update tenant status', { error: error.message });
    }
  });

  // Handle search input
  const handleSearchChange = (value: string) => {
    setQuery(prev => ({ 
      ...prev, 
      search: value, 
      page: 1 // Reset to first page on search
    }));
  };

  // Handle status filter
  const handleStatusFilter = (status: string) => {
    setQuery(prev => ({ 
      ...prev, 
      status: status as 'ACTIVE' | 'SUSPENDED' | 'ALL', 
      page: 1 // Reset to first page on filter
    }));
  };

  // Handle sorting
  const handleSort = (sortBy: 'name' | 'createdAt' | 'membershipCount') => {
    setQuery(prev => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === 'asc' ? 'desc' : 'asc'
    }));
  };

  // Handle pagination
  const handlePageChange = (page: number) => {
    setQuery(prev => ({ ...prev, page }));
  };

  // Handle tenant suspension
  const handleSuspendTenant = (tenant: TenantData) => {
    setSuspendingTenant(tenant);
  };

  const confirmSuspendTenant = () => {
    if (!suspendingTenant) return;
    
    const newStatus = suspendingTenant.status === 'ACTIVE' ? 'SUSPENDED' : 'ACTIVE';
    suspendTenantMutation.mutate({
      tenantId: suspendingTenant.id,
      status: newStatus
    });
  };

  // Error handling
  if (error) {
    const errorMessage = (error as any)?.response?.status === 403 
      ? 'Platform admin access required'
      : 'Failed to load tenants';
    
    return (
      <Card>
        <CardContent className="p-6">
          <div className="flex items-center gap-2 text-red-600">
            <AlertTriangle className="h-5 w-5" />
            <span>{errorMessage}</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  const tenants = tenantsResponse?.data || [];
  const pagination = tenantsResponse?.pagination;

  return (
    <div className="space-y-4">
      {/* Header with Create Button */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight">Tenant Management</h2>
          <p className="text-muted-foreground">
            Manage tenants and memberships across the platform
          </p>
        </div>
        <Button onClick={onCreateTenant} className="flex items-center gap-2">
          <Plus className="h-4 w-4" />
          Create Tenant
        </Button>
      </div>

      {/* Search and Filters */}
      <Card>
        <CardContent className="p-4">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search tenants by name, slug, or email..."
                  value={query.search || ''}
                  onChange={(e: React.ChangeEvent<HTMLInputElement>) => handleSearchChange(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <Select value={query.status || 'ALL'} onValueChange={handleStatusFilter}>
              <SelectTrigger className="w-48">
                <SelectValue placeholder="Filter by status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="ALL">All Tenants</SelectItem>
                <SelectItem value="ACTIVE">Active</SelectItem>
                <SelectItem value="SUSPENDED">Suspended</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      {/* Tenants Table */}
      <Card>
        <CardHeader>
          <CardTitle>
            Tenants ({pagination?.total || 0})
          </CardTitle>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="flex items-center justify-center p-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : tenants.length === 0 ? (
            <div className="text-center p-8 text-muted-foreground">
              {query.search ? 'No tenants found matching your search.' : 'No tenants found.'}
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('name')}
                  >
                    Name {query.sortBy === 'name' && (query.sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Slug</TableHead>
                  <TableHead>Billing Email</TableHead>
                  <TableHead>Currency</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('membershipCount')}
                  >
                    Users {query.sortBy === 'membershipCount' && (query.sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead 
                    className="cursor-pointer hover:bg-muted/50"
                    onClick={() => handleSort('createdAt')}
                  >
                    Created {query.sortBy === 'createdAt' && (query.sortOrder === 'asc' ? '↑' : '↓')}
                  </TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {tenants.map((tenant) => (
                  <TableRow key={tenant.id}>
                    <TableCell className="font-medium">{tenant.name}</TableCell>
                    <TableCell className="font-mono text-sm">{tenant.slug}</TableCell>
                    <TableCell>{tenant.billingEmail}</TableCell>
                    <TableCell>{tenant.defaultCurrency}</TableCell>
                    <TableCell>
                      <Badge 
                        variant={tenant.status === 'ACTIVE' ? 'default' : 'destructive'}
                      >
                        {tenant.status}
                      </Badge>
                    </TableCell>
                    <TableCell>{tenant.membershipCount}</TableCell>
                    <TableCell>
                      {new Date(tenant.createdAt).toLocaleDateString()}
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onViewTenant(tenant)}
                          className="flex items-center gap-1"
                        >
                          <Users className="h-4 w-4" />
                          View
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditTenant(tenant)}
                          className="flex items-center gap-1"
                        >
                          <Settings className="h-4 w-4" />
                          Edit
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleSuspendTenant(tenant)}
                          className={`flex items-center gap-1 ${
                            tenant.status === 'ACTIVE' 
                              ? 'text-red-600 hover:text-red-700' 
                              : 'text-green-600 hover:text-green-700'
                          }`}
                        >
                          {tenant.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}

          {/* Pagination */}
          {pagination && pagination.totalPages > 1 && (
            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                Showing {((pagination.page - 1) * pagination.limit) + 1} to{' '}
                {Math.min(pagination.page * pagination.limit, pagination.total)} of{' '}
                {pagination.total} tenants
              </div>
              <div className="flex items-center gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page - 1)}
                  disabled={!pagination.hasPrevious}
                >
                  Previous
                </Button>
                <span className="text-sm">
                  Page {pagination.page} of {pagination.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => handlePageChange(pagination.page + 1)}
                  disabled={!pagination.hasNext}
                >
                  Next
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Suspend/Reactivate Confirmation Dialog */}
      <AlertDialog open={!!suspendingTenant} onOpenChange={(open) => !open && setSuspendingTenant(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>
              {suspendingTenant?.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'} Tenant
            </AlertDialogTitle>
            <AlertDialogDescription>
              {suspendingTenant?.status === 'ACTIVE' ? (
                <>
                  Are you sure you want to suspend <strong>{suspendingTenant?.name}</strong>?
                  This will prevent all users in this tenant from accessing the platform.
                </>
              ) : (
                <>
                  Are you sure you want to reactivate <strong>{suspendingTenant?.name}</strong>?
                  This will restore access for all users in this tenant.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmSuspendTenant}
              className={
                suspendingTenant?.status === 'ACTIVE'
                  ? 'bg-red-600 hover:bg-red-700'
                  : 'bg-green-600 hover:bg-green-700'
              }
              disabled={suspendTenantMutation.isPending}
            >
              {suspendTenantMutation.isPending ? 'Processing...' : 
               suspendingTenant?.status === 'ACTIVE' ? 'Suspend' : 'Reactivate'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
};

export default TenantListTable;

