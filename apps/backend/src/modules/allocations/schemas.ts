import { PagingResponseSchema, createPagingResponse } from '@pivotal-flow/shared';
import { z } from 'zod';

import { ALLOCATION_ROLES } from './constants.js';

export const CreateAllocationRequestSchema = z.object({
  projectId: z.string().min(1, 'Project ID is required'),
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(Object.values(ALLOCATION_ROLES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid role' })
  }),
  allocationPercent: z.number()
    .min(0.01, 'Allocation percent must be at least 0.01')
    .max(100, 'Allocation percent cannot exceed 100'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  isBillable: z.boolean().optional().default(true),
  notes: z.record(z.any()).optional().default({})
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

// Schema for creating allocation without projectId (from URL params)
export const CreateAllocationBodySchema = z.object({
  userId: z.string().min(1, 'User ID is required'),
  role: z.enum(Object.values(ALLOCATION_ROLES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid role' })
  }),
  allocationPercent: z.number()
    .min(0.01, 'Allocation percent must be at least 0.01')
    .max(100, 'Allocation percent cannot exceed 100'),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format'),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format'),
  isBillable: z.boolean().optional().default(true),
  notes: z.record(z.any()).optional().default({})
}).refine((data) => {
  const startDate = new Date(data.startDate);
  const endDate = new Date(data.endDate);
  return endDate >= startDate;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

export const UpdateAllocationRequestSchema = z.object({
  role: z.enum(Object.values(ALLOCATION_ROLES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid role' })
  }).optional(),
  allocationPercent: z.number()
    .min(0.01, 'Allocation percent must be at least 0.01')
    .max(100, 'Allocation percent cannot exceed 100')
    .optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  isBillable: z.boolean().optional(),
  notes: z.record(z.any()).optional()
}).refine((data) => {
  if (data.startDate && data.endDate) {
    const startDate = new Date(data.startDate);
    const endDate = new Date(data.endDate);
    return endDate >= startDate;
  }
  return true;
}, {
  message: 'End date must be after or equal to start date',
  path: ['endDate']
});

export const AllocationFiltersSchema = z.object({
  projectId: z.string().optional(),
  userId: z.string().optional(),
  role: z.enum(Object.values(ALLOCATION_ROLES) as [string, ...string[]], {
    errorMap: () => ({ message: 'Invalid role' })
  }).optional(),
  startDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'Start date must be in YYYY-MM-DD format').optional(),
  endDate: z.string().regex(/^\d{4}-\d{2}-\d{2}$/, 'End date must be in YYYY-MM-DD format').optional(),
  isBillable: z.boolean().optional(),
  page: z.number().int().min(1).default(1),
  pageSize: z.number().int().min(1).max(100).default(20)
});

export const ResourceAllocationResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  projectId: z.string(),
  userId: z.string(),
  role: z.string(),
  allocationPercent: z.number(),
  startDate: z.string(),
  endDate: z.string(),
  isBillable: z.boolean(),
  notes: z.record(z.any()),
  createdAt: z.string(),
  updatedAt: z.string(),
  deletedAt: z.string().nullable()
});

// List allocations response schema using shared paging
export const ListAllocationsResponseSchema = PagingResponseSchema.extend({
  items: z.array(ResourceAllocationResponseSchema)
});

// Helper function to create paging response
export const createAllocationsPagingResponse = (
  allocations: z.infer<typeof ResourceAllocationResponseSchema>[],
  page: number,
  pageSize: number,
  total: number
) => {
  return createPagingResponse(allocations, page, pageSize, total);
};

export const CapacitySummarySchema = z.object({
  userId: z.string(),
  userName: z.string(),
  weekStart: z.string(),
  weekEnd: z.string(),
  plannedHours: z.number(),
  actualHours: z.number(),
  plannedPercent: z.number(),
  actualPercent: z.number(),
  variance: z.number()
});

export const WeeklyCapacitySummarySchema = z.object({
  projectId: z.string(),
  projectName: z.string(),
  weekStart: z.string(),
  weekEnd: z.string(),
  allocations: z.array(CapacitySummarySchema),
  totalPlannedHours: z.number(),
  totalActualHours: z.number(),
  totalPlannedPercent: z.number(),
  totalActualPercent: z.number(),
  totalVariance: z.number()
});

export const AllocationConflictSchema = z.object({
  userId: z.string(),
  userName: z.string(),
  conflictingAllocations: z.array(z.object({
    id: z.string(),
    projectId: z.string(),
    projectName: z.string(),
    role: z.string(),
    allocationPercent: z.number(),
    startDate: z.string(),
    endDate: z.string(),
    overlapStart: z.string(),
    overlapEnd: z.string(),
    totalAllocation: z.number()
  })),
  totalAllocation: z.number(),
  requestedAllocation: z.number(),
  conflictType: z.enum(['overlap', 'exceeds_100_percent'])
});
