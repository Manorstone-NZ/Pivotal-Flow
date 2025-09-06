import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { FastifyInstance } from 'fastify';
import { BaseRepository } from '../../lib/repo.base.js';
import type { ApprovalRequest, CreateApprovalRequest, ApproveRequest, RejectRequest, CancelRequest, ApprovalFilters, ApprovalPolicy } from './types.js';
/**
 * Approval Service
 *
 * Handles approval requests for quotes, invoices, and projects
 */
export declare class ApprovalService extends BaseRepository {
    private permissionService;
    private auditLogger;
    constructor(db: PostgresJsDatabase<typeof import('../../lib/schema.js')>, options: {
        organizationId: string;
        userId: string;
    }, fastify: FastifyInstance);
    /**
     * Create a new approval request
     */
    createApprovalRequest(data: CreateApprovalRequest): Promise<ApprovalRequest>;
    /**
     * Approve an approval request
     */
    approveRequest(requestId: string, data: ApproveRequest): Promise<ApprovalRequest>;
    /**
     * Reject an approval request
     */
    rejectRequest(requestId: string, data: RejectRequest): Promise<ApprovalRequest>;
    /**
     * Cancel an approval request
     */
    cancelRequest(requestId: string, data: CancelRequest): Promise<ApprovalRequest>;
    /**
     * Get approval requests with filters
     */
    getApprovalRequests(filters?: ApprovalFilters): Promise<ApprovalRequest[]>;
    /**
     * Get approval request by ID
     */
    getApprovalRequest(requestId: string): Promise<ApprovalRequest | null>;
    /**
     * Get organization approval policy
     */
    getApprovalPolicy(): Promise<ApprovalPolicy>;
    /**
     * Check if entity requires approval
     */
    requiresApproval(entityType: string, action: string): Promise<boolean>;
    /**
     * Update entity status after approval decision
     */
    private updateEntityStatus;
}
//# sourceMappingURL=service.d.ts.map