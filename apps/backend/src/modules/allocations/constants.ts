// Resource allocation constants
export const ALLOCATION_ROLES = {
  DEVELOPER: 'developer',
  DESIGNER: 'designer',
  PROJECT_MANAGER: 'project_manager',
  BUSINESS_ANALYST: 'business_analyst',
  TESTER: 'tester',
  DEVOPS: 'devops',
  ARCHITECT: 'architect',
  CONSULTANT: 'consultant'
} as const;

export type AllocationRole = typeof ALLOCATION_ROLES[keyof typeof ALLOCATION_ROLES];

export const ALLOCATION_PERMISSIONS = {
  CREATE: 'allocations.create',
  READ: 'allocations.read',
  UPDATE: 'allocations.update',
  DELETE: 'allocations.delete',
  VIEW_CAPACITY: 'allocations.view_capacity'
} as const;

export type AllocationPermission = typeof ALLOCATION_PERMISSIONS[keyof typeof ALLOCATION_PERMISSIONS];

// Metrics constants
export const ALLOCATION_METRICS = {
  CREATED_TOTAL: 'pivotal_allocation_created_total',
  CONFLICT_CHECKS_MS: 'pivotal_allocation_conflict_checks_ms'
} as const;
