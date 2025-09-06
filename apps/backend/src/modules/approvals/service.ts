import { generateId, required, auditUserId } from '@pivotal-flow/shared';
import { eq, and, desc } from 'drizzle-orm';
import type { PostgresJsDatabase } from 'drizzle-orm/postgres-js';
import type { FastifyInstance } from 'fastify';

import { createAuditLogger } from '../../lib/audit-logger.drizzle.js';
import { BaseRepository } from '../../lib/repo.base.js';
import { approvalRequests, orgSettings } from '../../lib/schema.js';
import { PermissionService } from '../permissions/service.js';


import { APPROVAL_STATUS, APPROVAL_ENTITY_TYPES, APPROVAL_POLICY_KEYS, type ApprovalEntityType } from './constants.js';
import type { 
  ApprovalRequest, 
  CreateApprovalRequest, 
  ApproveRequest, 
  RejectRequest, 
  CancelRequest,
  ApprovalFilters,
  ApprovalPolicy 
} from './types.js';

/**
 * Approval Service
 * 
 * Handles approval requests for quotes, invoices, and projects
 */
export class ApprovalService extends BaseRepository {
  private permissionService: PermissionService;
  private auditLogger: ReturnType<typeof createAuditLogger>;

  constructor(
    db: PostgresJsDatabase<typeof import('../../lib/schema.js')>,
    options: { organizationId: string; userId: string },
    fastify: FastifyInstance
  ) {
    super(db, options);
    this.permissionService = new PermissionService(db, options);
    this.auditLogger = createAuditLogger(fastify);
  }

  /**
   * Create a new approval request
   */
  async createApprovalRequest(data: CreateApprovalRequest): Promise<ApprovalRequest> {
    // Check if user has permission to request approvals
    const actorId = required(this.options.userId, "authenticated user id missing");
    const hasPermission = await this.permissionService.hasPermission(
      actorId, 
      'approvals.request' as any
    );

    if (!hasPermission.hasPermission) {
      throw new Error(`User does not have permission to request approvals: ${hasPermission.reason}`);
    }

    // Check if approver exists and has permission to decide
    const approverHasPermission = await this.permissionService.hasPermission(
      data.approverId, 
      'approvals.decide' as any
    );

    if (!approverHasPermission.hasPermission) {
      throw new Error(`Approver does not have permission to decide approvals: ${approverHasPermission.reason}`);
    }

    // Check if entity already has a pending approval request
    const existingRequest = await this.db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.entityType, data.entityType),
          eq(approvalRequests.entityId, data.entityId),
          eq(approvalRequests.status, APPROVAL_STATUS.PENDING)
        )
      )
      .limit(1);

    if (existingRequest.length > 0) {
      throw new Error(`Entity ${data.entityType}:${data.entityId} already has a pending approval request`);
    }

    const approvalRequest = {
      id: generateId(),
      organizationId: this.options.organizationId,
      entityType: data.entityType,
      entityId: data.entityId,
      requestedBy: this.options.userId!,
      approverId: data.approverId,
      status: APPROVAL_STATUS.PENDING,
      requestedAt: new Date(),
      reason: data.reason || '',
      notes: data.notes || {},
      createdAt: new Date(),
      updatedAt: new Date()
    };

    await this.db.insert(approvalRequests).values(approvalRequest);

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'approval.request_created',
      entityType: 'approval_request',
      entityId: approvalRequest.id,
      organizationId: this.options.organizationId,
      userId: auditUserId(this.options.userId),
      newValues: approvalRequest as unknown as Record<string, unknown>,
      metadata: {
        entityType: data.entityType,
        entityId: data.entityId,
        approverId: data.approverId
      }
    });

    return approvalRequest as ApprovalRequest;
  }

  /**
   * Approve an approval request
   */
  async approveRequest(requestId: string, data: ApproveRequest): Promise<ApprovalRequest> {
    // Check if user has permission to decide approvals
    const actorId = required(this.options.userId, "authenticated user id missing");
    const hasPermission = await this.permissionService.hasPermission(
      actorId, 
      'approvals.decide' as any
    );

    if (!hasPermission.hasPermission) {
      throw new Error(`User does not have permission to decide approvals: ${hasPermission.reason}`);
    }

    // Get the approval request
    const [request] = await this.db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.id, requestId),
          eq(approvalRequests.organizationId, this.options.organizationId)
        )
      );

    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    // Check if user is the approver
    if (request.approverId !== this.options.userId) {
      throw new Error('Only the assigned approver can approve this request');
    }

    // Check if request is pending
    if (request.status !== APPROVAL_STATUS.PENDING) {
      throw new Error(`Cannot approve request with status: ${request.status}`);
    }

    const oldValues = { ...request };
    const newValues: ApprovalRequest = {
      ...request,
      status: APPROVAL_STATUS.APPROVED,
      decidedAt: new Date(),
      reason: data.reason || request.reason || '',
      notes: { ...(request.notes as Record<string, unknown>), ...(data.notes || {}) },
      updatedAt: new Date(),
      entityType: request.entityType as ApprovalEntityType
    };

    await this.db
      .update(approvalRequests)
      .set(newValues)
      .where(eq(approvalRequests.id, requestId));

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'approval.request_approved',
      entityType: 'approval_request',
      entityId: requestId,
      organizationId: this.options.organizationId,
      userId: this.options.userId,
      oldValues,
      newValues: newValues as unknown as Record<string, unknown>,
      metadata: {
        entityType: request.entityType,
        entityId: request.entityId,
        reason: data.reason
      }
    });

    // Update the entity status based on type
    await this.updateEntityStatus(request.entityType as ApprovalEntityType, request.entityId, 'approved');

    return newValues;
  }

  /**
   * Reject an approval request
   */
  async rejectRequest(requestId: string, data: RejectRequest): Promise<ApprovalRequest> {
    // Check if user has permission to decide approvals
    const actorId = required(this.options.userId, "authenticated user id missing");
    const hasPermission = await this.permissionService.hasPermission(
      actorId, 
      'approvals.decide' as any
    );

    if (!hasPermission.hasPermission) {
      throw new Error(`User does not have permission to decide approvals: ${hasPermission.reason}`);
    }

    // Get the approval request
    const [request] = await this.db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.id, requestId),
          eq(approvalRequests.organizationId, this.options.organizationId)
        )
      );

    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    // Check if user is the approver
    if (request.approverId !== this.options.userId) {
      throw new Error('Only the assigned approver can reject this request');
    }

    // Check if request is pending
    if (request.status !== APPROVAL_STATUS.PENDING) {
      throw new Error(`Cannot reject request with status: ${request.status}`);
    }

    const oldValues = { ...request };
    const newValues: ApprovalRequest = {
      ...request,
      status: APPROVAL_STATUS.REJECTED,
      decidedAt: new Date(),
      reason: data.reason,
      notes: { ...(request.notes as Record<string, unknown>), ...(data.notes || {}) },
      updatedAt: new Date(),
      entityType: request.entityType as ApprovalEntityType
    };

    await this.db
      .update(approvalRequests)
      .set(newValues)
      .where(eq(approvalRequests.id, requestId));

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'approval.request_rejected',
      entityType: 'approval_request',
      entityId: requestId,
      organizationId: this.options.organizationId,
      userId: this.options.userId,
      oldValues,
      newValues: newValues as unknown as Record<string, unknown>,
      metadata: {
        entityType: request.entityType,
        entityId: request.entityId,
        reason: data.reason
      }
    });

    // Update the entity status based on type
    await this.updateEntityStatus(request.entityType as ApprovalEntityType, request.entityId, 'rejected');

    return newValues;
  }

  /**
   * Cancel an approval request
   */
  async cancelRequest(requestId: string, data: CancelRequest): Promise<ApprovalRequest> {
    // Get the approval request
    const [request] = await this.db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.id, requestId),
          eq(approvalRequests.organizationId, this.options.organizationId)
        )
      );

    if (!request) {
      throw new Error(`Approval request ${requestId} not found`);
    }

    // Check if user is the requester or approver
    if (request.requestedBy !== this.options.userId && request.approverId !== this.options.userId) {
      throw new Error('Only the requester or approver can cancel this request');
    }

    // Check if request is pending
    if (request.status !== APPROVAL_STATUS.PENDING) {
      throw new Error(`Cannot cancel request with status: ${request.status}`);
    }

    const oldValues = { ...request };
    const newValues: ApprovalRequest = {
      ...request,
      status: APPROVAL_STATUS.CANCELLED,
      decidedAt: new Date(),
      reason: data.reason || request.reason || '',
      notes: { ...(request.notes as Record<string, unknown>), ...(data.notes || {}) },
      updatedAt: new Date(),
      entityType: request.entityType as ApprovalEntityType
    };

    await this.db
      .update(approvalRequests)
      .set(newValues)
      .where(eq(approvalRequests.id, requestId));

    // Log audit event
    await this.auditLogger.logEvent({
      action: 'approval.request_cancelled',
      entityType: 'approval_request',
      entityId: requestId,
      organizationId: this.options.organizationId,
      userId: this.options.userId,
      oldValues,
      newValues: newValues as unknown as Record<string, unknown>,
      metadata: {
        entityType: request.entityType,
        entityId: request.entityId,
        reason: data.reason
      }
    });

    return newValues;
  }

  /**
   * Get approval requests with filters
   */
  async getApprovalRequests(filters: ApprovalFilters = {}): Promise<ApprovalRequest[]> {
    // Check if user has permission to view approvals
    const actorId = required(this.options.userId, "authenticated user id missing");
    const hasPermission = await this.permissionService.hasPermission(
      actorId, 
      'approvals.view' as any
    );

    if (!hasPermission.hasPermission) {
      throw new Error(`User does not have permission to view approvals: ${hasPermission.reason}`);
    }

    const conditions = [eq(approvalRequests.organizationId, this.options.organizationId)];

    if (filters.entityType) {
      conditions.push(eq(approvalRequests.entityType, filters.entityType));
    }

    if (filters.status) {
      conditions.push(eq(approvalRequests.status, filters.status));
    }

    if (filters.approverId) {
      conditions.push(eq(approvalRequests.approverId, filters.approverId));
    }

    if (filters.requestedBy) {
      conditions.push(eq(approvalRequests.requestedBy, filters.requestedBy));
    }

    const requests = await this.db
      .select()
      .from(approvalRequests)
      .where(and(...conditions))
      .orderBy(desc(approvalRequests.createdAt));

    return requests as ApprovalRequest[];
  }

  /**
   * Get approval request by ID
   */
  async getApprovalRequest(requestId: string): Promise<ApprovalRequest | null> {
    // Check if user has permission to view approvals
    const actorId = required(this.options.userId, "authenticated user id missing");
    const hasPermission = await this.permissionService.hasPermission(
      actorId, 
      'approvals.view' as any
    );

    if (!hasPermission.hasPermission) {
      throw new Error(`User does not have permission to view approvals: ${hasPermission.reason}`);
    }

    const [request] = await this.db
      .select()
      .from(approvalRequests)
      .where(
        and(
          eq(approvalRequests.id, requestId),
          eq(approvalRequests.organizationId, this.options.organizationId)
        )
      );

    return (request as ApprovalRequest) || null;
  }

  /**
   * Get organization approval policy
   */
  async getApprovalPolicy(): Promise<ApprovalPolicy> {
    const settings = await this.db
      .select()
      .from(orgSettings)
      .where(eq(orgSettings.orgId, this.options.organizationId));

    const policy: ApprovalPolicy = {
      quoteSendRequiresApproval: false,
      invoiceIssueRequiresApproval: false,
      projectCloseRequiresApproval: false
    };

    for (const setting of settings) {
      switch (setting.key) {
        case APPROVAL_POLICY_KEYS.QUOTE_SEND_REQUIRES_APPROVAL:
          policy.quoteSendRequiresApproval = setting.value as boolean;
          break;
        case APPROVAL_POLICY_KEYS.INVOICE_ISSUE_REQUIRES_APPROVAL:
          policy.invoiceIssueRequiresApproval = setting.value as boolean;
          break;
        case APPROVAL_POLICY_KEYS.PROJECT_CLOSE_REQUIRES_APPROVAL:
          policy.projectCloseRequiresApproval = setting.value as boolean;
          break;
      }
    }

    return policy;
  }

  /**
   * Check if entity requires approval
   */
  async requiresApproval(entityType: string, action: string): Promise<boolean> {
    const policy = await this.getApprovalPolicy();

    switch (entityType) {
      case APPROVAL_ENTITY_TYPES.QUOTE:
        return action === 'send' && policy.quoteSendRequiresApproval;
      case APPROVAL_ENTITY_TYPES.INVOICE:
        return action === 'issue' && policy.invoiceIssueRequiresApproval;
      case APPROVAL_ENTITY_TYPES.PROJECT:
        return action === 'close' && policy.projectCloseRequiresApproval;
      default:
        return false;
    }
  }

  /**
   * Update entity status after approval decision
   */
  private async updateEntityStatus(entityType: ApprovalEntityType, entityId: string, decision: string): Promise<void> {
    // This is a placeholder for entity status updates
    // In a real implementation, this would update the actual entity tables
    // For now, we just log the action
    await this.auditLogger.logEvent({
      action: `entity.${decision}`,
      entityType,
      entityId,
      organizationId: this.options.organizationId,
      userId: this.options.userId || null,
      metadata: {
        decision,
        approvalRequired: true
      }
    });
  }
}
