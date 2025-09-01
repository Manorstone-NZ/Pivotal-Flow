// Permission types for the application

export interface Permission {
  id: string;
  name: string;
  description: string;
  category: string;
  resource: string;
  action: string;
  createdAt: Date;
}

export interface PermissionCheck {
  hasPermission: boolean;
  reason?: string;
}

export interface UserContext {
  userId: string;
  organizationId: string;
  roles: string[];
}

export interface RolePermissions {
  roleId: string;
  permissions: string[];
}

export type PermissionName = 
  | 'quotes.view'
  | 'quotes.create'
  | 'quotes.update'
  | 'quotes.delete'
  | 'quotes.approve'
  | 'quotes.send'
  | 'quotes.override_price'
  | 'rate_cards.view'
  | 'rate_cards.create'
  | 'rate_cards.update'
  | 'rate_cards.delete'
  | 'users.view'
  | 'users.create'
  | 'users.update'
  | 'users.delete'
  | 'users.manage_roles'
  | 'customers.view'
  | 'customers.create'
  | 'customers.update'
  | 'customers.delete'
  | 'projects.view'
  | 'projects.create'
  | 'projects.update'
  | 'projects.delete';
