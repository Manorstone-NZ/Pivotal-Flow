/**
 * Simple Audit Logging
 * Basic audit logging using the existing audit_logs table
 */

import type { FastifyInstance } from 'fastify';
import { auditLogs } from './schema.js';

export interface SimpleAuditEntry {
  organizationId: string;
  userId: string;
  action: string;
  resource: string;
  resourceId?: string;
  details?: Record<string, any>;
  ipAddress?: string;
  userAgent?: string;
  success?: boolean;
  errorMessage?: string;
}

export class SimpleAuditLogger {
  constructor(private fastify: FastifyInstance) {}

  async log(entry: SimpleAuditEntry): Promise<void> {
    try {
      const auditData = {
        id: `audit-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
        organizationId: entry.organizationId,
        userId: entry.userId,
        action: entry.action,
        resource: entry.resource,
        resourceId: entry.resourceId || null,
        details: entry.details || {},
        ipAddress: entry.ipAddress || null,
        userAgent: entry.userAgent || null,
        success: entry.success !== false,
        errorMessage: entry.errorMessage || null,
        timestamp: new Date(),
        metadata: {
          version: '1.0',
          source: 'tenant-admin-system',
        },
      };

      await (this.fastify as any).db.insert(auditLogs).values(auditData);

      // Log to console for development
      this.fastify.log.info({
        audit: {
          action: auditData.action,
          resource: auditData.resource,
          userId: auditData.userId,
          organizationId: auditData.organizationId,
          success: auditData.success,
        }
      }, '📝 Audit log created');

    } catch (error) {
      // Never let audit logging break the application
      this.fastify.log.error({ error, entry }, 'Failed to create audit log');
    }
  }

  async logPermissionCheck(data: {
    userId: string;
    organizationId: string;
    action: string;
    requiredPermission: string;
    route: string;
    success: boolean;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      organizationId: data.organizationId,
      userId: data.userId,
      action: data.success ? 'permission.granted' : 'permission.denied',
      resource: 'permission',
      details: {
        requiredPermission: data.requiredPermission,
        route: data.route,
        originalAction: data.action,
      },
      ipAddress: data.ipAddress ?? 'unknown',
      userAgent: data.userAgent ?? 'unknown',
      success: data.success,
      ...(data.success ? {} : { errorMessage: `Permission denied: ${data.requiredPermission}` }),
    });
  }

  async logAuthentication(data: {
    userId: string;
    userEmail: string;
    organizationId: string;
    action: 'login' | 'logout' | 'login_failed';
    ipAddress?: string;
    userAgent?: string;
    success: boolean;
    errorMessage?: string;
  }): Promise<void> {
    await this.log({
      organizationId: data.organizationId,
      userId: data.userId,
      action: `auth.${data.action}`,
      resource: 'authentication',
      details: {
        userEmail: data.userEmail,
      },
      ipAddress: data.ipAddress ?? 'unknown',
      userAgent: data.userAgent ?? 'unknown',
      success: data.success,
      ...(data.errorMessage ? { errorMessage: data.errorMessage } : {}),
    });
  }

  async logDataAccess(data: {
    userId: string;
    organizationId: string;
    action: string;
    resource: string;
    resourceId?: string;
    recordCount?: number;
    ipAddress?: string;
    userAgent?: string;
  }): Promise<void> {
    await this.log({
      organizationId: data.organizationId,
      userId: data.userId,
      action: data.action,
      resource: data.resource,
      ...(data.resourceId ? { resourceId: data.resourceId } : {}),
      details: {
        ...(data.recordCount ? { recordCount: data.recordCount } : {}),
      },
      ipAddress: data.ipAddress ?? 'unknown',
      userAgent: data.userAgent ?? 'unknown',
      success: true,
    });
  }
}
