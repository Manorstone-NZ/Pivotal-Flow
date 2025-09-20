/**
 * Tenant Switcher Component
 * Multi-tenant organization switcher for header
 */

import React, { useState } from 'react';
import { ChevronDownIcon, BuildingOfficeIcon } from '@heroicons/react/24/outline';

import { Button } from '../Button';
import { useOrganizations, type Organization } from '../../features/tenancy/api';
import { useAuth } from '../../features/auth/store';
import { useTenantContext } from '../../features/tenancy/context';
import { apiClient } from '../../lib/api-client';
import { useQueryClient } from '@tanstack/react-query';

interface TenantSwitcherProps {
  currentOrganization?: Organization;
  onOrganizationChange?: (organization: Organization) => void;
}

export const TenantSwitcher: React.FC<TenantSwitcherProps> = ({
  currentOrganization,
  onOrganizationChange,
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [isSwitching, setIsSwitching] = useState(false);
  const { hasPermission } = useAuth();
  const { currentTenant, setCurrentTenant } = useTenantContext();
  const queryClient = useQueryClient();

  // Only show for super admins who can manage organizations across tenants
  if (!hasPermission('system.super_admin')) {
    return null;
  }

  // Get user's organizations
  const { data: organizationsData, isLoading, error } = useOrganizations();
  const organizations = organizationsData?.data || [];

  // Set default organization when data loads
  React.useEffect(() => {
    if (organizations.length > 0 && !currentTenant) {
      // Default to "Pivotal Flow Ltd" if available, otherwise first organization
      const defaultOrg = organizations.find(org => org.slug === 'pivotal-flow') || organizations[0];
      setCurrentTenant(defaultOrg);
    }
  }, [organizations, currentTenant, setCurrentTenant]);

  const handleOrganizationSelect = async (organization: Organization) => {
    setIsOpen(false);
    setIsSwitching(true);
    onOrganizationChange?.(organization);
    
    console.log('🔄 Starting tenant switch to:', organization.name, '(ID:', organization.id, ')');
    
    try {
      // 1. Update global tenant context (persists to localStorage)
      setCurrentTenant(organization);
      
      // 2. Update API client headers for subsequent requests
      apiClient.setTenantId(organization.id);
      console.log('✅ API client tenant ID updated to:', organization.id);
      
      // 3. Invalidate and refetch all tenant-specific data
      await queryClient.invalidateQueries({ queryKey: ['customers'] });
      await queryClient.invalidateQueries({ queryKey: ['organizations'] });
      await queryClient.invalidateQueries({ queryKey: ['projects'] });
      await queryClient.invalidateQueries({ queryKey: ['quotes'] });
      await queryClient.invalidateQueries({ queryKey: ['time-entries'] });
      console.log('✅ Tenant-specific queries invalidated');
      
      // 4. Force immediate refetch of all invalidated queries
      await queryClient.refetchQueries({ 
        queryKey: ['customers'],
        type: 'active' 
      });
      console.log('✅ Customer queries refetched with new tenant context');
      
      console.log('🎉 Tenant switch complete! Now showing data for:', organization.name);
    } catch (error) {
      console.error('❌ Error switching tenant:', error);
    } finally {
      setIsSwitching(false);
    }
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <BuildingOfficeIcon className="h-4 w-4 animate-pulse" />
        <span>Loading...</span>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="flex items-center space-x-2 text-sm text-red-500">
        <BuildingOfficeIcon className="h-4 w-4" />
        <span>Error loading orgs</span>
      </div>
    );
  }

  // Show empty state
  if (organizations.length === 0) {
    return (
      <div className="flex items-center space-x-2 text-sm text-gray-500">
        <BuildingOfficeIcon className="h-4 w-4" />
        <span>No organizations</span>
      </div>
    );
  }

  return (
    <div className="relative">
      <Button
        variant="ghost"
        size="sm"
        onClick={() => setIsOpen(!isOpen)}
        disabled={isSwitching}
        className="flex items-center space-x-2 max-w-48 disabled:opacity-50"
        aria-label="Switch organization"
        aria-expanded={isOpen}
        aria-haspopup="listbox"
        data-testid="tenant-switcher"
      >
        <BuildingOfficeIcon className={`h-4 w-4 ${isSwitching ? 'animate-pulse' : ''}`} />
        <span className="truncate">
          {isSwitching ? 'Switching...' : (currentTenant?.name || 'Select Organization')}
        </span>
        <ChevronDownIcon className="h-4 w-4" />
      </Button>

      {isOpen && (
        <>
          {/* Backdrop */}
          <div
            className="fixed inset-0 z-10"
            onClick={() => setIsOpen(false)}
            aria-hidden="true"
          />
          
          {/* Dropdown */}
          <div className="absolute right-0 mt-2 w-64 bg-white rounded-lg shadow-lg border border-gray-200 z-20">
            <div className="p-2">
              <div className="text-xs font-medium text-gray-500 px-3 py-2">
                Switch Organization
              </div>
              
              <div className="space-y-1" role="listbox">
                {organizations.map((org) => (
                  <button
                    key={org.id}
                    onClick={() => handleOrganizationSelect(org)}
                    className={`w-full text-left px-3 py-2 rounded-md text-sm hover:bg-gray-100 transition-colors ${
                      currentTenant?.id === org.id
                        ? 'bg-blue-500 text-white hover:bg-blue-600'
                        : 'text-gray-900'
                    }`}
                    role="option"
                    aria-selected={currentTenant?.id === org.id}
                  >
                    <div className="font-medium">{org.name}</div>
                    <div className="text-xs text-gray-500">
                      {org.slug} • {org.subscriptionPlan}
                    </div>
                  </button>
                ))}
              </div>
              
              <div className="border-t border-gray-200 mt-2 pt-2">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    setIsOpen(false);
                    // Navigate to organization management
                    window.location.href = '/admin/tenants';
                  }}
                  className="w-full text-left"
                >
                  Manage Organizations
                </Button>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};
