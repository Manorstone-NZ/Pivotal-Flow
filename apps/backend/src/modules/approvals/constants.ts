// Approval constants for the application
export const APPROVAL_ENTITY_TYPES = {
  QUOTE: 'quote',
  INVOICE: 'invoice',
  PROJECT: 'project'
} as const;

export type ApprovalEntityType = typeof APPROVAL_ENTITY_TYPES[keyof typeof APPROVAL_ENTITY_TYPES];

export const APPROVAL_STATUS = {
  PENDING: 'pending',
  APPROVED: 'approved',
  REJECTED: 'rejected',
  CANCELLED: 'cancelled'
} as const;

export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];

// Permission constants for approvals
export const APPROVAL_PERMISSIONS = {
  REQUEST: 'approvals.request',
  DECIDE: 'approvals.decide',
  VIEW: 'approvals.view'
} as const;

export type ApprovalPermission = typeof APPROVAL_PERMISSIONS[keyof typeof APPROVAL_PERMISSIONS];

// Organization policy settings for approvals
export const APPROVAL_POLICY_KEYS = {
  QUOTE_SEND_REQUIRES_APPROVAL: 'quote_send_requires_approval',
  INVOICE_ISSUE_REQUIRES_APPROVAL: 'invoice_issue_requires_approval',
  PROJECT_CLOSE_REQUIRES_APPROVAL: 'project_close_requires_approval'
} as const;

export type ApprovalPolicyKey = typeof APPROVAL_POLICY_KEYS[keyof typeof APPROVAL_POLICY_KEYS];
