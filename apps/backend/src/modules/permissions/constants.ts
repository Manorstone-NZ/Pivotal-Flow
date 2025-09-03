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
  ALLOCATIONS: 'allocations'
} as const;
