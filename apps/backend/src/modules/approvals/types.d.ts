import type { ApprovalEntityType, ApprovalStatus } from './constants.js';
export interface ApprovalRequest {
    id: string;
    organizationId: string;
    entityType: ApprovalEntityType;
    entityId: string;
    requestedBy: string;
    approverId: string;
    status: ApprovalStatus;
    requestedAt: Date;
    decidedAt?: Date;
    reason?: string;
    notes: Record<string, unknown>;
    createdAt: Date;
    updatedAt: Date;
}
export interface CreateApprovalRequest {
    entityType: ApprovalEntityType;
    entityId: string;
    approverId: string;
    reason?: string;
    notes?: Record<string, unknown>;
}
export interface ApproveRequest {
    reason?: string;
    notes?: Record<string, unknown>;
}
export interface RejectRequest {
    reason: string;
    notes?: Record<string, unknown>;
}
export interface CancelRequest {
    reason?: string;
    notes?: Record<string, unknown>;
}
export interface ApprovalFilters {
    entityType?: ApprovalEntityType;
    status?: ApprovalStatus;
    approverId?: string;
    requestedBy?: string;
    organizationId?: string;
}
export interface ApprovalPolicy {
    quoteSendRequiresApproval: boolean;
    invoiceIssueRequiresApproval: boolean;
    projectCloseRequiresApproval: boolean;
}
//# sourceMappingURL=types.d.ts.map