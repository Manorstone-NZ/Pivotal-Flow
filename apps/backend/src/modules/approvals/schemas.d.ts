import type { Static } from '@sinclair/typebox';
export declare const CreateApprovalRequestSchema: import("@sinclair/typebox").TObject<{
    entityType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quote">, import("@sinclair/typebox").TLiteral<"invoice">, import("@sinclair/typebox").TLiteral<"project">]>;
    entityId: import("@sinclair/typebox").TString;
    approverId: import("@sinclair/typebox").TString;
    reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export declare const ApproveRequestSchema: import("@sinclair/typebox").TObject<{
    reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export declare const RejectRequestSchema: import("@sinclair/typebox").TObject<{
    reason: import("@sinclair/typebox").TString;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export declare const CancelRequestSchema: import("@sinclair/typebox").TObject<{
    reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    notes: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export declare const ApprovalFiltersSchema: import("@sinclair/typebox").TObject<{
    entityType: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quote">, import("@sinclair/typebox").TLiteral<"invoice">, import("@sinclair/typebox").TLiteral<"project">]>>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    approverId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    requestedBy: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    page: import("@sinclair/typebox").TNumber;
    pageSize: import("@sinclair/typebox").TNumber;
}>;
export declare const ApprovalRequestResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    entityType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quote">, import("@sinclair/typebox").TLiteral<"invoice">, import("@sinclair/typebox").TLiteral<"project">]>;
    entityId: import("@sinclair/typebox").TString;
    requestedBy: import("@sinclair/typebox").TString;
    approverId: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
    requestedAt: import("@sinclair/typebox").TString;
    decidedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    notes: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export declare const ApprovalPolicyResponseSchema: import("@sinclair/typebox").TObject<{
    quoteSendRequiresApproval: import("@sinclair/typebox").TBoolean;
    invoiceIssueRequiresApproval: import("@sinclair/typebox").TBoolean;
    projectCloseRequiresApproval: import("@sinclair/typebox").TBoolean;
}>;
export declare const ListApprovalsResponseSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TNumber;
    pageSize: import("@sinclair/typebox").TNumber;
    total: import("@sinclair/typebox").TNumber;
    totalPages: import("@sinclair/typebox").TNumber;
    items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        entityType: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"quote">, import("@sinclair/typebox").TLiteral<"invoice">, import("@sinclair/typebox").TLiteral<"project">]>;
        entityId: import("@sinclair/typebox").TString;
        requestedBy: import("@sinclair/typebox").TString;
        approverId: import("@sinclair/typebox").TString;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
        requestedAt: import("@sinclair/typebox").TString;
        decidedAt: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        reason: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        notes: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
}>;
export type CreateApprovalRequest = Static<typeof CreateApprovalRequestSchema>;
export type ApproveRequest = Static<typeof ApproveRequestSchema>;
export type RejectRequest = Static<typeof RejectRequestSchema>;
export type CancelRequest = Static<typeof CancelRequestSchema>;
export type ApprovalFilters = Static<typeof ApprovalFiltersSchema>;
export type ApprovalRequestResponse = Static<typeof ApprovalRequestResponseSchema>;
export type ApprovalPolicyResponse = Static<typeof ApprovalPolicyResponseSchema>;
export type ListApprovalsResponse = Static<typeof ListApprovalsResponseSchema>;
export declare function createApprovalsPagingResponse(approvals: ApprovalRequestResponse[], page: number, pageSize: number, total: number): {
    page: number;
    pageSize: number;
    total: number;
    totalPages: number;
    items: {
        decidedAt?: string;
        reason?: string;
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: "pending" | "cancelled" | "approved" | "rejected";
        entityType: "project" | "quote" | "invoice";
        entityId: string;
        notes: {
            [x: string]: any;
        };
        requestedBy: string;
        approverId: string;
        requestedAt: string;
    }[];
};
//# sourceMappingURL=schemas.d.ts.map