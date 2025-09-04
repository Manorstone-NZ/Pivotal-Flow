// Permission constants for the application
export const PERMISSIONS = {
  // Quote permissions
  QUOTES: {
    VIEW: 'quotes.view',
    CREATE: 'quotes.create',
    UPDATE: 'quotes.update',
    DELETE: 'quotes.delete',
    APPROVE: 'quotes.approve',
    SEND: 'quotes.send',
    OVERRIDE_PRICE: 'quotes.override_price'
  },
  
  // Rate card permissions
  RATE_CARDS: {
    VIEW: 'rate_cards.view',
    CREATE: 'rate_cards.create',
    UPDATE: 'rate_cards.update',
    DELETE: 'rate_cards.delete'
  },
  
  // User permissions
  USERS: {
    VIEW: 'users.view',
    CREATE: 'users.create',
    UPDATE: 'users.update',
    DELETE: 'users.delete',
    MANAGE_ROLES: 'users.manage_roles'
  },
  
  // Customer permissions
  CUSTOMERS: {
    VIEW: 'customers.view',
    CREATE: 'customers.create',
    UPDATE: 'customers.update',
    DELETE: 'customers.delete'
  },
  
  // Project permissions
  PROJECTS: {
    VIEW: 'projects.view',
    CREATE: 'projects.create',
    UPDATE: 'projects.update',
    DELETE: 'projects.delete'
  },
  
  // Approval permissions
  APPROVALS: {
    VIEW: 'approvals.view',
    REQUEST: 'approvals.request',
    DECIDE: 'approvals.decide'
  },
  
  // Allocation permissions
  ALLOCATIONS: {
    CREATE: 'allocations.create',
    READ: 'allocations.read',
    UPDATE: 'allocations.update',
    DELETE: 'allocations.delete',
    VIEW_CAPACITY: 'allocations.view_capacity'
  },
  
  // Portal permissions (for external customer users)
  PORTAL: {
    VIEW_OWN_QUOTES: 'portal.view_own_quotes',
    VIEW_OWN_INVOICES: 'portal.view_own_invoices',
    VIEW_OWN_TIME_ENTRIES: 'portal.view_own_time_entries'
  },
  
  // Reports permissions
  REPORTS: {
    VIEW_REPORTS: 'reports.view_reports',
    EXPORT_REPORTS: 'reports.export_reports',
    VIEW_COMPLIANCE: 'reports.view_compliance'
  },
  
  // Jobs permissions
  JOBS: {
    CREATE_JOBS: 'jobs.create_jobs',
    VIEW_JOBS: 'jobs.view_jobs',
    CANCEL_JOBS: 'jobs.cancel_jobs',
    RETRY_JOBS: 'jobs.retry_jobs'
  },
  
  // Files permissions
  FILES: {
    GENERATE_FILES: 'files.generate_files',
    ACCESS_FILES: 'files.access_files',
    VIEW_FILES: 'files.view_files',
    DELETE_FILES: 'files.delete_files',
    CLEANUP_FILES: 'files.cleanup_files'
  }
} as const;

// All permissions as a flat array for easy checking
export const ALL_PERMISSIONS = Object.values(PERMISSIONS).flatMap(category => 
  Object.values(category)
);

// Permission categories for organization
export const PERMISSION_CATEGORIES = {
  QUOTES: 'quotes',
  RATE_CARDS: 'rate_cards',
  USERS: 'users',
  CUSTOMERS: 'customers',
  PROJECTS: 'projects',
  APPROVALS: 'approvals',
  ALLOCATIONS: 'allocations',
  PORTAL: 'portal',
  REPORTS: 'reports',
  JOBS: 'jobs',
  FILES: 'files'
} as const;
