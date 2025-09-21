/**
 * Tenancy List Page
 * Admin-only page for managing organizations/tenants
 */

import React, { useState, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { PlusIcon, PencilIcon, TrashIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

import { Button } from '../../components/Button';
import { Input } from '../../components/ui/input';
import { Card, CardContent, CardTitle } from '../../components/ui/card';
import { FormModal } from '../../components/ui/FormModal';
import { LoadingSpinner } from '../../components/ui/LoadingSpinner';
import { Badge } from '../../components/ui/badge';
import { OrganizationFormSimple } from '../../components/tenancy/OrganizationFormSimple';
import { useOrganizations, useDeleteOrganization, type OrganizationFilters, type PaginationOptions } from '../../features/tenancy/api';
import { useAuth } from '../../features/auth/store';
import { useToast } from '../../components/ui/Toast';
import { format } from 'date-fns';

export const TenancyListPage: React.FC = () => {
  const navigate = useNavigate();
  const { hasPermission } = useAuth();
  const { success, error: showError } = useToast();
  
  // State
  const [search, setSearch] = useState('');
  const [industryFilter, setIndustryFilter] = useState('');
  const [subscriptionFilter, setSubscriptionFilter] = useState('');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
  const [currentPage, setCurrentPage] = useState(1);
  const [showNewOrgModal, setShowNewOrgModal] = useState(false);

  // Check permissions - only super admins can manage organizations
  if (!hasPermission('system.super_admin')) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Access Denied</h2>
          <p className="text-gray-500">You need super admin privileges to manage organizations.</p>
        </div>
      </div>
    );
  }

  // Build filters
  const filters: OrganizationFilters = useMemo(() => ({
    search: search || undefined,
    industry: industryFilter || undefined,
    subscriptionStatus: subscriptionFilter || undefined,
    sortBy,
    sortOrder,
  }), [search, industryFilter, subscriptionFilter, sortBy, sortOrder]);

  const pagination: PaginationOptions = useMemo(() => ({
    page: currentPage,
    limit: 20,
  }), [currentPage]);

  // API hooks
  const { data: organizationsData, isLoading, error } = useOrganizations(filters, pagination);
  const deleteOrganizationMutation = useDeleteOrganization();

  const organizations = organizationsData?.data || [];
  const paginationInfo = organizationsData?.pagination;

  // Handlers
  const handleSearch = (value: string) => {
    setSearch(value);
    setCurrentPage(1);
  };

  const handleFilterChange = (field: string, value: any) => {
    if (field === 'industry') setIndustryFilter(value);
    if (field === 'subscription') setSubscriptionFilter(value);
    setCurrentPage(1);
  };

  const handleSort = (field: string) => {
    if (sortBy === field) {
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      setSortBy(field);
      setSortOrder('asc');
    }
    setCurrentPage(1);
  };

  const handleDeleteOrganization = async (org: Organization) => {
    if (!confirm(`Are you sure you want to delete "${org.name}"? This action cannot be undone.`)) {
      return;
    }

    try {
      await deleteOrganizationMutation.mutateAsync(org.id);
      success('Organization deleted successfully');
    } catch (error) {
      showError('Failed to delete organization');
    }
  };

  const handleNewOrganizationSuccess = (organization: Organization) => {
    setShowNewOrgModal(false);
    success('Organization created successfully');
    // Navigate to the new organization details
    navigate(`/admin/tenants/${organization.id}`);
  };

  const getStatusVariant = (status: string) => {
    switch (status) {
      case 'active': return 'success';
      case 'trial': return 'warning';
      case 'inactive': return 'secondary';
      case 'expired': return 'error';
      default: return 'secondary';
    }
  };

  const getSizeLabel = (size?: string) => {
    switch (size) {
      case 'small': return '1-10 employees';
      case 'medium': return '11-50 employees';
      case 'large': return '51-200 employees';
      case 'enterprise': return '200+ employees';
      default: return 'Not specified';
    }
  };

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <BuildingOfficeIcon className="h-12 w-12 text-red-400 mx-auto mb-4" />
          <h2 className="text-lg font-medium text-gray-900 mb-2">Error Loading Organizations</h2>
          <p className="text-gray-500 mb-4">Failed to load organization data.</p>
          <Button onClick={() => window.location.reload()}>Retry</Button>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Page Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-bold text-text-primary">Organizations</h1>
          <p className="text-text-secondary">Manage organizations and tenants</p>
        </div>
        
        <Button
          onClick={() => setShowNewOrgModal(true)}
          className="flex items-center space-x-2"
          data-testid="new-organization-button"
        >
          <PlusIcon className="h-4 w-4" />
          <span>New Organization</span>
        </Button>
      </div>

      {/* Filters */}
      <Card>
        <CardContent className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Search
              </label>
              <Input
                placeholder="Search organizations..."
                value={search}
                onChange={handleSearch}
                data-testid="search-organizations"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Industry
              </label>
              <select
                value={industryFilter}
                onChange={(e) => handleFilterChange('industry', e.target.value)}
                data-testid="filter-industry"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">All Industries</option>
                <option value="Technology">Technology</option>
                <option value="Healthcare">Healthcare</option>
                <option value="Finance">Finance</option>
                <option value="Education">Education</option>
                <option value="Manufacturing">Manufacturing</option>
                <option value="Retail">Retail</option>
                <option value="Other">Other</option>
              </select>
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Subscription
              </label>
              <select
                value={subscriptionFilter}
                onChange={(e) => handleFilterChange('subscription', e.target.value)}
                data-testid="filter-subscription"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-brand-primary focus:border-brand-primary"
              >
                <option value="">All Subscriptions</option>
                <option value="active">Active</option>
                <option value="trial">Trial</option>
                <option value="inactive">Inactive</option>
                <option value="expired">Expired</option>
              </select>
            </div>
            
            <div className="flex items-end">
              <Button
                variant="outline"
                onClick={() => {
                  setSearch('');
                  setIndustryFilter('');
                  setSubscriptionFilter('');
                  setCurrentPage(1);
                }}
                data-testid="clear-filters"
              >
                Clear Filters
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Organizations Table */}
      <Card>
        <CardContent className="p-0">
          {isLoading ? (
            <div className="flex items-center justify-center py-12">
              <LoadingSpinner size="lg" />
            </div>
          ) : organizations.length === 0 ? (
            <div className="text-center py-12">
              <BuildingOfficeIcon className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">No Organizations Found</h3>
              <p className="text-gray-500 mb-4">
                {search || industryFilter || subscriptionFilter
                  ? 'No organizations match your current filters.'
                  : 'Get started by creating your first organization.'}
              </p>
              <Button
                onClick={() => setShowNewOrgModal(true)}
                className="flex items-center space-x-2"
              >
                <PlusIcon className="h-4 w-4" />
                <span>Create Organization</span>
              </Button>
            </div>
          ) : (
            <>
              {/* Table */}
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-50 border-b border-gray-200">
                    <tr>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('name')}
                      >
                        Organization Name
                        {sortBy === 'name' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Industry
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Region
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Currency
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Status
                      </th>
                      <th
                        className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider cursor-pointer hover:bg-gray-100"
                        onClick={() => handleSort('createdAt')}
                      >
                        Created
                        {sortBy === 'createdAt' && (
                          <span className="ml-1">
                            {sortOrder === 'asc' ? '↑' : '↓'}
                          </span>
                        )}
                      </th>
                      <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="bg-white divide-y divide-gray-200">
                    {organizations.map((org) => (
                      <tr key={org.id} className="hover:bg-gray-50">
                        <td className="px-6 py-4">
                          <div>
                            <div className="text-sm font-medium text-gray-900">{org.name}</div>
                            <div className="text-sm text-gray-500">{org.slug}</div>
                            {org.domain && (
                              <div className="text-xs text-gray-400">{org.domain}</div>
                            )}
                          </div>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {org.industry || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {org.city && org.country ? `${org.city}, ${org.country}` : org.country || '-'}
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-900">
                          {org.currency}
                        </td>
                        <td className="px-6 py-4">
                          <Badge
                            variant={getStatusVariant(org.subscriptionStatus)}
                            size="sm"
                          >
                            {org.subscriptionStatus}
                          </Badge>
                        </td>
                        <td className="px-6 py-4 text-sm text-gray-500">
                          {format(new Date(org.createdAt), 'MMM d, yyyy')}
                        </td>
                        <td className="px-6 py-4 text-right">
                          <div className="flex items-center justify-end space-x-2">
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/tenants/${org.id}`)}
                              data-testid={`view-org-${org.id}`}
                              aria-label={`View ${org.name}`}
                            >
                              View
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => navigate(`/admin/tenants/${org.id}?edit=true`)}
                              data-testid={`edit-org-${org.id}`}
                              aria-label={`Edit ${org.name}`}
                            >
                              <PencilIcon className="h-4 w-4" />
                            </Button>
                            <Button
                              variant="ghost"
                              size="sm"
                              onClick={() => handleDeleteOrganization(org)}
                              className="text-red-600 hover:text-red-800"
                              data-testid={`delete-org-${org.id}`}
                              aria-label={`Delete ${org.name}`}
                            >
                              <TrashIcon className="h-4 w-4" />
                            </Button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>

              {/* Pagination */}
              {paginationInfo && paginationInfo.totalPages > 1 && (
                <div className="flex items-center justify-between px-6 py-4 border-t border-gray-200">
                  <div className="text-sm text-gray-700">
                    Showing {((paginationInfo.page - 1) * paginationInfo.limit) + 1} to{' '}
                    {Math.min(paginationInfo.page * paginationInfo.limit, paginationInfo.total)} of{' '}
                    {paginationInfo.total} organizations
                  </div>
                  
                  <div className="flex items-center space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage <= 1}
                      onClick={() => setCurrentPage(currentPage - 1)}
                    >
                      Previous
                    </Button>
                    
                    {Array.from({ length: Math.min(5, paginationInfo.totalPages) }, (_, i) => {
                      const pageNum = i + 1;
                      return (
                        <Button
                          key={pageNum}
                          variant={pageNum === currentPage ? "primary" : "outline"}
                          size="sm"
                          onClick={() => setCurrentPage(pageNum)}
                        >
                          {pageNum}
                        </Button>
                      );
                    })}
                    
                    <Button
                      variant="outline"
                      size="sm"
                      disabled={currentPage >= paginationInfo.totalPages}
                      onClick={() => setCurrentPage(currentPage + 1)}
                    >
                      Next
                    </Button>
                  </div>
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* New Organization Modal */}
      <FormModal
        open={showNewOrgModal}
        onClose={() => setShowNewOrgModal(false)}
        title="Create New Organization"
        size="lg"
      >
        <OrganizationFormSimple
          onSuccess={handleNewOrganizationSuccess}
          onCancel={() => setShowNewOrgModal(false)}
        />
      </FormModal>
    </div>
  );
};

export default TenancyListPage;
