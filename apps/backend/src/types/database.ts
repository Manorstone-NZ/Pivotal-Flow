// Database-related types moved from shared package

export interface FilterBuilderOptions {
  q?: string;
  isActive?: boolean;
  createdFrom?: Date;
  createdTo?: Date;
  roleId?: string;
}

export interface SortBuilderOptions {
  field?: 'createdAt' | 'email';
  direction?: 'asc' | 'desc';
}

export interface UserListFilters extends FilterBuilderOptions {
  q?: string;
  isActive?: boolean;
  roleId?: string;
  createdFrom?: Date;
  createdTo?: Date;
}
