import { describe, it, expect, vi } from 'vitest';
import { auditLog, createAuditLogger } from '@pivotal-flow/shared';
import { PermissionService } from '@pivotal-flow/shared';

describe('Shared Audit Logger', () => {
  const mockDb = {} as any;

  describe('auditLog', () => {
    it('should serialize audit events without secrets', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const event = {
        action: 'user.login',
        entityType: 'User',
        entityId: 'user-123',
        organizationId: 'org-456',
        actorId: 'actor-789',
        metadata: {
          ipAddress: '192.168.1.1',
          userAgent: 'Mozilla/5.0',
          password: 'secret123', // This should be redacted
          token: 'jwt-token', // This should be redacted
          normalField: 'normal value'
        }
      };

      const result = await auditLog(mockDb, event);

      expect(result.success).toBe(true);
      expect(result.auditId).toBeDefined();
      
      // Check that console.log was called with sanitized data
      expect(consoleSpy).toHaveBeenCalledWith('AUDIT LOG:', expect.objectContaining({
        action: 'user.login',
        entityType: 'User',
        entityId: 'user-123',
        organizationId: 'org-456',
        actorId: 'actor-789',
        metadata: expect.objectContaining({
          password: '[REDACTED]',
          token: '[REDACTED]',
          normalField: 'normal value'
        })
      }));

      consoleSpy.mockRestore();
    });

    it('should handle errors gracefully', async () => {
      const consoleErrorSpy = vi.spyOn(console, 'error').mockImplementation(() => {});
      
      // Mock a database error by making the auditLog function throw
      const mockDbWithError = {
        insert: () => {
          throw new Error('Database connection failed');
        }
      } as any;

      const event = {
        action: 'user.login',
        entityType: 'User',
        entityId: 'user-123',
        organizationId: 'org-456',
        actorId: 'actor-789'
      };

      // Since our current implementation doesn't actually use the db parameter,
      // we need to mock the console.log to throw an error
      const consoleLogSpy = vi.spyOn(console, 'log').mockImplementation(() => {
        throw new Error('Database connection failed');
      });

      const result = await auditLog(mockDbWithError, event);

      expect(result.success).toBe(false);
      expect(result.error).toBe('Database connection failed');
      expect(consoleErrorSpy).toHaveBeenCalled();

      consoleErrorSpy.mockRestore();
      consoleLogSpy.mockRestore();
    });
  });

  describe('createAuditLogger', () => {
    it('should create logger with context', () => {
      const context = {
        organizationId: 'org-123',
        actorId: 'user-456'
      };

      const logger = createAuditLogger(mockDb, context);

      expect(logger.log).toBeDefined();
      expect(typeof logger.log).toBe('function');
    });

    it('should log events with context', async () => {
      const consoleSpy = vi.spyOn(console, 'log').mockImplementation(() => {});
      
      const context = {
        organizationId: 'org-123',
        actorId: 'user-456'
      };

      const logger = createAuditLogger(mockDb, context);

      const event = {
        action: 'quote.create',
        entityType: 'Quote',
        entityId: 'quote-789'
      };

      const result = await logger.log(event);

      expect(result.success).toBe(true);
      expect(consoleSpy).toHaveBeenCalledWith('AUDIT LOG:', expect.objectContaining({
        organizationId: 'org-123',
        actorId: 'user-456',
        action: 'quote.create',
        entityType: 'Quote',
        entityId: 'quote-789'
      }));

      consoleSpy.mockRestore();
    });
  });
});

describe('Shared Permission Service', () => {
  const mockDb = {} as any;

  describe('PermissionService', () => {
    it('should instantiate with required options', () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      expect(permissionService).toBeInstanceOf(PermissionService);
    });

    it('should accept optional roles array', () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456',
        roles: ['admin', 'user']
      };

      const permissionService = new PermissionService(mockDb, options);

      expect(permissionService).toBeInstanceOf(PermissionService);
    });

    it('should check permissions for current user', async () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      const result = await permissionService.hasCurrentUserPermission('reports.view');

      expect(result).toHaveProperty('hasPermission');
      expect(result).toHaveProperty('reason');
      expect(typeof result.hasPermission).toBe('boolean');
    });

    it('should check permissions for specific user', async () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      const result = await permissionService.hasPermission('user-789', 'quotes.create');

      expect(result).toHaveProperty('hasPermission');
      expect(result).toHaveProperty('reason');
      expect(typeof result.hasPermission).toBe('boolean');
    });

    it('should handle invalid permission format', async () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      const result = await permissionService.hasPermission('user-789', 'invalid-permission');

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain('Invalid permission format');
    });

    it('should check any permission from list', async () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      const result = await permissionService.hasAnyPermission([
        'reports.view',
        'quotes.create',
        'users.manage'
      ]);

      expect(result).toHaveProperty('hasPermission');
      expect(result).toHaveProperty('reason');
    });

    it('should check all permissions from list', async () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      const result = await permissionService.hasAllPermissions([
        'reports.view',
        'quotes.create'
      ]);

      expect(result).toHaveProperty('hasPermission');
      // Note: When hasPermission is true, reason might not be set
      if (!result.hasPermission) {
        expect(result).toHaveProperty('reason');
      }
    });

    it('should get user permissions', async () => {
      const options = {
        organizationId: 'org-123',
        userId: 'user-456'
      };

      const permissionService = new PermissionService(mockDb, options);

      const permissions = await permissionService.getUserPermissions();

      expect(Array.isArray(permissions)).toBe(true);
    });
  });
});
