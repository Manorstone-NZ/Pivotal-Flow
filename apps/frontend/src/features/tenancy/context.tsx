import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from './api';
import { apiClient } from '../../lib/api-client';

interface TenantContextType {
  currentTenant: Organization | null;
  setCurrentTenant: (tenant: Organization | null) => void;
  isLoading: boolean;
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenantState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  // Load tenant from localStorage on mount
  useEffect(() => {
    const savedTenant = localStorage.getItem('pivotal-flow-tenant');
    if (savedTenant) {
      try {
        const tenant = JSON.parse(savedTenant);
        setCurrentTenantState(tenant);
        // Ensure API client is synced with saved tenant
        apiClient.setTenantId(tenant.id);
        console.log('🔄 Restored tenant context from localStorage:', tenant.name, '(ID:', tenant.id, ')');
      } catch (error) {
        console.error('Failed to parse saved tenant:', error);
        localStorage.removeItem('pivotal-flow-tenant');
      }
    }
    setIsLoading(false);
  }, []);

  const setCurrentTenant = (tenant: Organization | null) => {
    setCurrentTenantState(tenant);
    
    if (tenant) {
      // Persist tenant selection
      localStorage.setItem('pivotal-flow-tenant', JSON.stringify(tenant));
      // Update API client tenant context
      apiClient.setTenantId(tenant.id);
      console.log('Tenant context switched to:', tenant.name, '(ID:', tenant.id, ')');
    } else {
      localStorage.removeItem('pivotal-flow-tenant');
      // Clear API client tenant context
      apiClient.setTenantId(null);
      console.log('Tenant context cleared');
    }
  };

  return (
    <TenantContext.Provider value={{ currentTenant, setCurrentTenant, isLoading }}>
      {children}
    </TenantContext.Provider>
  );
};

export const useTenantContext = () => {
  const context = useContext(TenantContext);
  if (context === undefined) {
    throw new Error('useTenantContext must be used within a TenantProvider');
  }
  return context;
};

// Hook to get current tenant ID for API calls
export const useCurrentTenantId = (): string | null => {
  const { currentTenant } = useTenantContext();
  return currentTenant?.id || null;
};
