import { z } from 'zod';
export declare const CreateApprovalRequestSchema: z.ZodObject<{
    entityType: z.ZodEnum<[string, ...string[]]>;
    entityId: z.ZodString;
    approverId: z.ZodString;
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    entityType: string;
    entityId: string;
    approverId: string;
    notes?: Record<string, any> | undefined;
    reason?: string | undefined;
}, {
    entityType: string;
    entityId: string;
    approverId: string;
    notes?: Record<string, any> | undefined;
    reason?: string | undefined;
}>;
export declare const ApproveRequestSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    notes?: Record<string, any> | undefined;
    reason?: string | undefined;
}, {
    notes?: Record<string, any> | undefined;
    reason?: string | undefined;
}>;
export declare const RejectRequestSchema: z.ZodObject<{
    reason: z.ZodString;
    notes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    reason: string;
    notes?: Record<string, any> | undefined;
}, {
    reason: string;
    notes?: Record<string, any> | undefined;
}>;
export declare const CancelRequestSchema: z.ZodObject<{
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    notes?: Record<string, any> | undefined;
    reason?: string | undefined;
}, {
    notes?: Record<string, any> | undefined;
    reason?: string | undefined;
}>;
export declare const ApprovalFiltersSchema: z.ZodObject<{
    entityType: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    status: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    approverId: z.ZodOptional<z.ZodString>;
    requestedBy: z.ZodOptional<z.ZodString>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    status?: string | undefined;
    entityType?: string | undefined;
    requestedBy?: string | undefined;
    approverId?: string | undefined;
}, {
    status?: string | undefined;
    entityType?: string | undefined;
    requestedBy?: string | undefined;
    approverId?: string | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const ApprovalRequestResponseSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    entityType: z.ZodEnum<[string, ...string[]]>;
    entityId: z.ZodString;
    requestedBy: z.ZodString;
    approverId: z.ZodString;
    status: z.ZodEnum<[string, ...string[]]>;
    requestedAt: z.ZodString;
    decidedAt: z.ZodOptional<z.ZodString>;
    reason: z.ZodOptional<z.ZodString>;
    notes: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: string;
    entityType: string;
    entityId: string;
    notes: Record<string, any>;
    requestedBy: string;
    approverId: string;
    requestedAt: string;
    decidedAt?: string | undefined;
    reason?: string | undefined;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: string;
    entityType: string;
    entityId: string;
    notes: Record<string, any>;
    requestedBy: string;
    approverId: string;
    requestedAt: string;
    decidedAt?: string | undefined;
    reason?: string | undefined;
}>;
export declare const ApprovalPolicyResponseSchema: z.ZodObject<{
    quoteSendRequiresApproval: z.ZodBoolean;
    invoiceIssueRequiresApproval: z.ZodBoolean;
    projectCloseRequiresApproval: z.ZodBoolean;
}, "strip", z.ZodTypeAny, {
    quoteSendRequiresApproval: boolean;
    invoiceIssueRequiresApproval: boolean;
    projectCloseRequiresApproval: boolean;
}, {
    quoteSendRequiresApproval: boolean;
    invoiceIssueRequiresApproval: boolean;
    projectCloseRequiresApproval: boolean;
}>;
export declare const ListApprovalsResponseSchema: z.ZodObject<{
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
} & {
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        entityType: z.ZodEnum<[string, ...string[]]>;
        entityId: z.ZodString;
        requestedBy: z.ZodString;
        approverId: z.ZodString;
        status: z.ZodEnum<[string, ...string[]]>;
        requestedAt: z.ZodString;
        decidedAt: z.ZodOptional<z.ZodString>;
        reason: z.ZodOptional<z.ZodString>;
        notes: z.ZodRecord<z.ZodString, z.ZodAny>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: string;
        entityType: string;
        entityId: string;
        notes: Record<string, any>;
        requestedBy: string;
        approverId: string;
        requestedAt: string;
        decidedAt?: string | undefined;
        reason?: string | undefined;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: string;
        entityType: string;
        entityId: string;
        notes: Record<string, any>;
        requestedBy: string;
        approverId: string;
        requestedAt: string;
        decidedAt?: string | undefined;
        reason?: string | undefined;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    items: {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: string;
        entityType: string;
        entityId: string;
        notes: Record<string, any>;
        requestedBy: string;
        approverId: string;
        requestedAt: string;
        decidedAt?: string | undefined;
        reason?: string | undefined;
    }[];
    total: number;
    totalPages: number;
}, {
    page: number;
    pageSize: number;
    items: {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        status: string;
        entityType: string;
        entityId: string;
        notes: Record<string, any>;
        requestedBy: string;
        approverId: string;
        requestedAt: string;
        decidedAt?: string | undefined;
        reason?: string | undefined;
    }[];
    total: number;
    totalPages: number;
}>;
export declare const createApprovalsPagingResponse: (approvals: z.infer<typeof ApprovalRequestResponseSchema>[], page: number, pageSize: number, total: number) => import("@pivotal-flow/shared").PagingResponse<{
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    status: string;
    entityType: string;
    entityId: string;
    notes: Record<string, any>;
    requestedBy: string;
    approverId: string;
    requestedAt: string;
    decidedAt?: string | undefined;
    reason?: string | undefined;
}>;
//# sourceMappingURL=schemas.d.ts.map