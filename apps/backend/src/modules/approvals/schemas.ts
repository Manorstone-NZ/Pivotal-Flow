import { z } from 'zod';
import { APPROVAL_ENTITY_TYPES, APPROVAL_STATUS } from './constants.js';

// Create approval request schema
export const CreateApprovalRequestSchema = z.object({
  entityType: z.enum(Object.values(APPROVAL_ENTITY_TYPES) as [string, ...string[]]),
  entityId: z.string().uuid('Entity ID must be a valid UUID'),
  approverId: z.string().uuid('Approver ID must be a valid UUID'),
  reason: z.string().max(1000).optional(),
  notes: z.record(z.any()).optional()
});

// Approve request schema
export const ApproveRequestSchema = z.object({
  reason: z.string().max(1000).optional(),
  notes: z.record(z.any()).optional()
});

// Reject request schema
export const RejectRequestSchema = z.object({
  reason: z.string().min(1, 'Reason is required for rejection').max(1000),
  notes: z.record(z.any()).optional()
});

// Cancel request schema
export const CancelRequestSchema = z.object({
  reason: z.string().max(1000).optional(),
  notes: z.record(z.any()).optional()
});

// Approval filters schema
export const ApprovalFiltersSchema = z.object({
  entityType: z.enum(Object.values(APPROVAL_ENTITY_TYPES) as [string, ...string[]]).optional(),
  status: z.enum(Object.values(APPROVAL_STATUS) as [string, ...string[]]).optional(),
  approverId: z.string().uuid('Approver ID must be a valid UUID').optional(),
  requestedBy: z.string().uuid('Requested by ID must be a valid UUID').optional()
});

// Approval request response schema
export const ApprovalRequestResponseSchema = z.object({
  id: z.string(),
  organizationId: z.string(),
  entityType: z.enum(Object.values(APPROVAL_ENTITY_TYPES) as [string, ...string[]]),
  entityId: z.string(),
  requestedBy: z.string(),
  approverId: z.string(),
  status: z.enum(Object.values(APPROVAL_STATUS) as [string, ...string[]]),
  requestedAt: z.string().datetime(),
  decidedAt: z.string().datetime().optional(),
  reason: z.string().optional(),
  notes: z.record(z.any()),
  createdAt: z.string().datetime(),
  updatedAt: z.string().datetime()
});

// Approval policy response schema
export const ApprovalPolicyResponseSchema = z.object({
  quoteSendRequiresApproval: z.boolean(),
  invoiceIssueRequiresApproval: z.boolean(),
  projectCloseRequiresApproval: z.boolean()
});

// List approvals response schema
export const ListApprovalsResponseSchema = z.object({
  approvals: z.array(ApprovalRequestResponseSchema),
  total: z.number(),
  page: z.number(),
  limit: z.number()
});
