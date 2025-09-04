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
  | 'projects.delete'
  | 'approvals.view'
  | 'approvals.request'
  | 'approvals.decide'
  | 'allocations.create'
  | 'allocations.read'
  | 'allocations.update'
  | 'allocations.delete'
  | 'allocations.view_capacity'
  | 'portal.view_own_quotes'
  | 'portal.view_own_invoices'
  | 'portal.view_own_time_entries'
  | 'reports.view_reports'
  | 'reports.export_reports'
  | 'reports.view_compliance'
  | 'jobs.create_jobs'
  | 'jobs.view_jobs'
  | 'jobs.cancel_jobs'
  | 'jobs.retry_jobs'
  | 'files.generate_files'
  | 'files.access_files'
  | 'files.view_files'
  | 'files.delete_files'
  | 'files.cleanup_files';
