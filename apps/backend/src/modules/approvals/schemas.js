import { Type } from '@sinclair/typebox';
// Create approval request schema
export const CreateApprovalRequestSchema = Type.Object({
    entityType: Type.Union([
        Type.Literal('quote'),
        Type.Literal('invoice'),
        Type.Literal('project')
    ]),
    entityId: Type.String({ format: 'uuid' }),
    approverId: Type.String({ format: 'uuid' }),
    reason: Type.Optional(Type.String({ maxLength: 1000 })),
    notes: Type.Optional(Type.Record(Type.String(), Type.Any())),
});
// Approve request schema
export const ApproveRequestSchema = Type.Object({
    reason: Type.Optional(Type.String()),
    notes: Type.Optional(Type.Record(Type.String(), Type.Any())),
});
// Reject request schema
export const RejectRequestSchema = Type.Object({
    reason: Type.String(),
    notes: Type.Optional(Type.Record(Type.String(), Type.Any())),
});
// Cancel request schema
export const CancelRequestSchema = Type.Object({
    reason: Type.Optional(Type.String()),
    notes: Type.Optional(Type.Record(Type.String(), Type.Any())),
});
// Approval filters schema
export const ApprovalFiltersSchema = Type.Object({
    entityType: Type.Optional(Type.Union([
        Type.Literal('quote'),
        Type.Literal('invoice'),
        Type.Literal('project')
    ])),
    status: Type.Optional(Type.Union([
        Type.Literal('pending'),
        Type.Literal('approved'),
        Type.Literal('rejected'),
        Type.Literal('cancelled')
    ])),
    approverId: Type.Optional(Type.String({ format: 'uuid' })),
    requestedBy: Type.Optional(Type.String({ format: 'uuid' })),
    page: Type.Number({ minimum: 1, default: 1 }),
    pageSize: Type.Number({ minimum: 1, maximum: 100, default: 25 }),
});
// Approval request response schema
export const ApprovalRequestResponseSchema = Type.Object({
    id: Type.String({ format: 'uuid' }),
    organizationId: Type.String({ format: 'uuid' }),
    entityType: Type.Union([
        Type.Literal('quote'),
        Type.Literal('invoice'),
        Type.Literal('project')
    ]),
    entityId: Type.String({ format: 'uuid' }),
    requestedBy: Type.String({ format: 'uuid' }),
    approverId: Type.String({ format: 'uuid' }),
    status: Type.Union([
        Type.Literal('pending'),
        Type.Literal('approved'),
        Type.Literal('rejected'),
        Type.Literal('cancelled')
    ]),
    requestedAt: Type.String({ format: 'date-time' }),
    decidedAt: Type.Optional(Type.String({ format: 'date-time' })),
    reason: Type.Optional(Type.String()),
    notes: Type.Record(Type.String(), Type.Any()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
});
// Approval policy response schema
export const ApprovalPolicyResponseSchema = Type.Object({
    quoteSendRequiresApproval: Type.Boolean(),
    invoiceIssueRequiresApproval: Type.Boolean(),
    projectCloseRequiresApproval: Type.Boolean(),
});
// List approvals response schema
export const ListApprovalsResponseSchema = Type.Object({
    page: Type.Number(),
    pageSize: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
    items: Type.Array(ApprovalRequestResponseSchema),
});
// Helper function to create paging response
export function createApprovalsPagingResponse(approvals, page, pageSize, total) {
    const totalPages = Math.ceil(total / pageSize);
    return {
        page,
        pageSize,
        total,
        totalPages,
        items: approvals
    };
}
//# sourceMappingURL=schemas.js.map