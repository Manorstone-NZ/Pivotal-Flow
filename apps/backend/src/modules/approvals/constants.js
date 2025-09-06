// Approval constants for the application
export const APPROVAL_ENTITY_TYPES = {
    QUOTE: 'quote',
    INVOICE: 'invoice',
    PROJECT: 'project'
};
export const APPROVAL_STATUS = {
    PENDING: 'pending',
    APPROVED: 'approved',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
};
// Permission constants for approvals
export const APPROVAL_PERMISSIONS = {
    REQUEST: 'approvals.request',
    DECIDE: 'approvals.decide',
    VIEW: 'approvals.view'
};
// Organization policy settings for approvals
export const APPROVAL_POLICY_KEYS = {
    QUOTE_SEND_REQUIRES_APPROVAL: 'quote_send_requires_approval',
    INVOICE_ISSUE_REQUIRES_APPROVAL: 'invoice_issue_requires_approval',
    PROJECT_CLOSE_REQUIRES_APPROVAL: 'project_close_requires_approval'
};
//# sourceMappingURL=constants.js.map