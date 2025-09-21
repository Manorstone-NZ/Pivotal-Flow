import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { Organization } from './api';
import { useAuth } from '../auth/store';

interface TenantContextType {
  currentTenant: Organization | null;
  tenantId: string | null;
  isLoading: boolean;
  // F1.5: No client-side tenant switching - tenant derived from server token only
}

const TenantContext = createContext<TenantContextType | undefined>(undefined);

interface TenantProviderProps {
  children: ReactNode;
}

export const TenantProvider: React.FC<TenantProviderProps> = ({ children }) => {
  const [currentTenant, setCurrentTenantState] = useState<Organization | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // F1.5: Extract tenant from server-issued token only
  useEffect(() => {
    if (isAuthenticated && user?.organizationId) {
      // In F1.5, tenantId comes from the server-issued PASETO token
      // TODO: Load organization details if needed for display
      setCurrentTenantState({
        id: user.organizationId,
        name: 'Current Organization', // TODO: Load actual organization name from API
        // Add other properties as needed
      } as Organization);
    } else {
      setCurrentTenantState(null);
    }
    setIsLoading(false);
  }, [isAuthenticated, user]);

  const tenantId = user?.organizationId || null;

  return (
    <TenantContext.Provider value={{ currentTenant, tenantId, isLoading }}>
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

// F1.5: Hook to get current tenant ID from server token for API calls
export const useCurrentTenantId = (): string | null => {
  const { tenantId } = useTenantContext();
  return tenantId;
};

// Hook to get tenant context for React Query keys
export const useTenantId = (): string | null => {
  const { tenantId } = useTenantContext();
  return tenantId;
};
