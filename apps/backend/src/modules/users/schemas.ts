// User validation schemas using Zod

import { z } from 'zod';


// User creation schema
export const userCreateSchema = z.object({
  email: z.string().email('Invalid email format').min(1, 'Email is required').max(255, 'Email too long'),
  firstName: z.string().min(1, 'First name is required').max(100, 'First name too long'),
  lastName: z.string().min(1, 'Last name is required').max(100, 'Last name too long'),
  displayName: z.string().max(200, 'Display name too long').optional(),
  phone: z.string().max(20, 'Phone number too long').optional(),
  timezone: z.string().max(50, 'Timezone too long').optional(),
  locale: z.string().max(10, 'Locale too long').optional()
}).strict('Unknown fields not allowed');

// User update schema
export const userUpdateSchema = z.object({
  displayName: z.string().max(200, 'Display name too long').optional(),
  isActive: z.boolean().optional()
}).strict('Unknown fields not allowed');

// User list filters schema
export const userListFiltersSchema = z.object({
  q: z.string().optional(),
  isActive: z.boolean().optional(),
  roleId: z.string().optional()
}).strict('Unknown fields not allowed');

// User list sort schema
export const userListSortSchema = z.object({
  field: z.enum(['email', 'createdAt']).default('createdAt'),
  direction: z.enum(['asc', 'desc']).default('desc')
}).strict('Unknown fields not allowed');

// Pagination schema
export const paginationSchema = z.object({
  page: z.coerce.number().int().min(1, 'Page must be at least 1').default(1),
  pageSize: z.coerce.number().int().min(1, 'Page size must be at least 1').max(100, 'Page size cannot exceed 100').default(20)
}).strict('Unknown fields not allowed');

// Role assignment schema
export const roleAssignmentSchema = z.object({
  roleId: z.string()
}).strict('Unknown fields not allowed');

// User status schema
export const userStatusSchema = z.object({
  isActive: z.boolean()
}).strict('Unknown fields not allowed');

// User ID parameter schema
export const userIdParamSchema = z.object({
  id: z.string()
}).strict('Unknown fields not allowed');

// Role ID parameter schema
export const roleIdParamSchema = z.object({
  id: z.string(),
  roleId: z.string()
}).strict('Unknown fields not allowed');

// Response schemas
export const userResponseSchema = z.object({
  id: z.string(),
  email: z.string(),
  displayName: z.string().nullable(),
  isActive: z.boolean(),
  mfaEnabled: z.boolean(),
  createdAt: z.date(),
  roles: z.array(z.object({
    id: z.string(),
    name: z.string(),
    description: z.string().nullable(),
    isSystem: z.boolean(),
    isActive: z.boolean()
  }))
});

export const userListResponseSchema = z.object({
  items: z.array(userResponseSchema),
  page: z.number(),
  pageSize: z.number(),
  total: z.number(),
  totalPages: z.number()
});

export const successResponseSchema = z.object({
  success: z.boolean(),
  message: z.string()
});

// Error response schemas
export const errorResponseSchema = z.object({
  error: z.string(),
  message: z.string(),
  code: z.string().optional(),
  details: z.unknown().optional()
});

export const validationErrorSchema = z.object({
  error: z.literal('Validation Error'),
  message: z.string(),
  code: z.literal('VALIDATION_ERROR'),
  details: z.array(z.object({
    field: z.string(),
    message: z.string()
  }))
});

// Type exports for use in routes
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserListFiltersInput = z.infer<typeof userListFiltersSchema>;
export type UserListSortInput = z.infer<typeof userListSortSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type RoleIdParam = z.infer<typeof roleIdParamSchema>;
