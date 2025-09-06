export declare const APPROVAL_ENTITY_TYPES: {
    readonly QUOTE: "quote";
    readonly INVOICE: "invoice";
    readonly PROJECT: "project";
};
export type ApprovalEntityType = typeof APPROVAL_ENTITY_TYPES[keyof typeof APPROVAL_ENTITY_TYPES];
export declare const APPROVAL_STATUS: {
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly REJECTED: "rejected";
    readonly CANCELLED: "cancelled";
};
export type ApprovalStatus = typeof APPROVAL_STATUS[keyof typeof APPROVAL_STATUS];
export declare const APPROVAL_PERMISSIONS: {
    readonly REQUEST: "approvals.request";
    readonly DECIDE: "approvals.decide";
    readonly VIEW: "approvals.view";
};
export type ApprovalPermission = typeof APPROVAL_PERMISSIONS[keyof typeof APPROVAL_PERMISSIONS];
export declare const APPROVAL_POLICY_KEYS: {
    readonly QUOTE_SEND_REQUIRES_APPROVAL: "quote_send_requires_approval";
    readonly INVOICE_ISSUE_REQUIRES_APPROVAL: "invoice_issue_requires_approval";
    readonly PROJECT_CLOSE_REQUIRES_APPROVAL: "project_close_requires_approval";
};
export type ApprovalPolicyKey = typeof APPROVAL_POLICY_KEYS[keyof typeof APPROVAL_POLICY_KEYS];
//# sourceMappingURL=constants.d.ts.map