import { describe, it, expect, beforeEach, vi } from 'vitest';
import { PermissionService } from '../service.js';
import { permissions } from '../../../lib/schema.js';

// Mock database
const mockDb = {
  select: vi.fn().mockReturnThis(),
  from: vi.fn().mockReturnThis(),
  innerJoin: vi.fn().mockReturnThis(),
  where: vi.fn().mockReturnThis(),
  limit: vi.fn().mockReturnThis(),
  offset: vi.fn().mockReturnThis(),
  orderBy: vi.fn().mockReturnThis(),
  insert: vi.fn().mockReturnThis(),
  values: vi.fn().mockReturnThis(),
  update: vi.fn().mockReturnThis(),
  set: vi.fn().mockReturnThis(),
  delete: vi.fn().mockReturnThis(),
  query: vi.fn(),
} as any;

const mockOptions = {
  organizationId: 'org-123',
  userId: 'user-123'
};

describe('PermissionService', () => {
  let permissionService: PermissionService;

  beforeEach(() => {
    vi.clearAllMocks();
    permissionService = new PermissionService(mockDb, mockOptions);
  });

  describe('hasPermission', () => {
    it('should return true when user has permission through role', async () => {
      const mockPermissionResult = [
        {
          permissionId: 'perm-123',
          action: 'override_price',
          resource: 'quotes',
          category: 'quotes'
        }
      ];

      const mockPolicyResult: any[] = [];

      mockDb.where.mockResolvedValueOnce(mockPermissionResult);
      mockDb.where.mockResolvedValueOnce(mockPolicyResult);

      const result = await permissionService.hasPermission('user-123', 'quotes.override_price');

      expect(result.hasPermission).toBe(true);
      expect(mockDb.select).toHaveBeenCalledWith({
        permissionId: permissions.id,
        action: permissions.action,
        resource: permissions.resource,
        category: permissions.category
      });
    });

    it('should return false when user lacks permission', async () => {
      const mockPermissionResult: any[] = [];

      mockDb.where.mockResolvedValueOnce(mockPermissionResult);

      const result = await permissionService.hasPermission('user-123', 'quotes.override_price');

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('User lacks permission: quotes.override_price');
    });

    it('should return false for invalid permission format', async () => {
      const result = await permissionService.hasPermission('user-123', 'quotes.invalid_permission' as any);

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toBe('Invalid permission format: invalid-permission');
    });

    it('should handle database errors gracefully', async () => {
      mockDb.where.mockRejectedValueOnce(new Error('Database connection failed'));

      const result = await permissionService.hasPermission('user-123', 'quotes.override_price');

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain('Database connection failed');
    });
  });

  describe('canOverrideQuotePrice', () => {
    it('should check quotes.override_price permission', async () => {
      const mockPermissionResult = [
        {
          permissionId: 'perm-123',
          action: 'override_price',
          resource: 'quotes',
          category: 'quotes'
        }
      ];

      const mockPolicyResult: any[] = [];

      mockDb.where.mockResolvedValueOnce(mockPermissionResult);
      mockDb.where.mockResolvedValueOnce(mockPolicyResult);

      const result = await permissionService.canOverrideQuotePrice('user-123');

      expect(result.hasPermission).toBe(true);
    });
  });

  describe('getUserPermissions', () => {
    it('should return all user permissions formatted as action.resource', async () => {
      const mockPermissionsResult = [
        { action: 'view', resource: 'quotes' },
        { action: 'create', resource: 'quotes' },
        { action: 'override_price', resource: 'quotes' },
        { action: 'view', resource: 'rate_cards' }
      ];

      mockDb.where.mockResolvedValueOnce(mockPermissionsResult);

      const result = await permissionService.getUserPermissions('user-123');

      expect(result).toEqual([
        'view.quotes',
        'create.quotes',
        'override_price.quotes',
        'view.rate_cards'
      ]);
    });

    it('should remove duplicate permissions', async () => {
      const mockPermissionsResult = [
        { action: 'view', resource: 'quotes' },
        { action: 'view', resource: 'quotes' }, // Duplicate
        { action: 'create', resource: 'quotes' }
      ];

      mockDb.where.mockResolvedValueOnce(mockPermissionsResult);

      const result = await permissionService.getUserPermissions('user-123');

      expect(result).toEqual(['view.quotes', 'create.quotes']);
    });

    it('should return empty array on error', async () => {
      mockDb.where.mockRejectedValueOnce(new Error('Database error'));

      const result = await permissionService.getUserPermissions('user-123');

      expect(result).toEqual([]);
    });
  });

  describe('hasAnyPermission', () => {
    it('should return true if user has any of the specified permissions', async () => {
      const mockPermissionsResult = [
        { action: 'view', resource: 'quotes' },
        { action: 'create', resource: 'quotes' }
      ];

      mockDb.where.mockResolvedValue(mockPermissionsResult);

      const result = await permissionService.hasAnyPermission('user-123', [
        'quotes.view',
        'quotes.create',
        'quotes.delete'
      ]);

      expect(result.hasPermission).toBe(true);
    });

    it('should return false if user has none of the specified permissions', async () => {
      const mockPermissionsResult: any[] = [];

      mockDb.where.mockResolvedValue(mockPermissionsResult);

      const result = await permissionService.hasAnyPermission('user-123', [
        'quotes.delete',
        'quotes.approve'
      ]);

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain('quotes.delete, quotes.approve');
    });
  });

  describe('hasAllPermissions', () => {
    it('should return true if user has all specified permissions', async () => {
      const mockPermissionsResult = [
        { action: 'view', resource: 'quotes' },
        { action: 'create', resource: 'quotes' },
        { action: 'update', resource: 'quotes' }
      ];

      mockDb.where.mockResolvedValue(mockPermissionsResult);

      const result = await permissionService.hasAllPermissions('user-123', [
        'quotes.view',
        'quotes.create',
        'quotes.update'
      ]);

      expect(result.hasPermission).toBe(true);
    });

    it('should return false if user lacks any of the specified permissions', async () => {
      const mockPermissionsResult = [
        { action: 'view', resource: 'quotes' },
        { action: 'create', resource: 'quotes' }
        // Missing 'quotes.update'
      ];

      mockDb.where.mockResolvedValue(mockPermissionsResult);

      const result = await permissionService.hasAllPermissions('user-123', [
        'quotes.view',
        'quotes.create',
        'quotes.update'
      ]);

      expect(result.hasPermission).toBe(false);
      expect(result.reason).toContain('quotes.update');
    });
  });

  describe('policy overrides', () => {
    it('should check policy overrides when evaluating permissions', async () => {
      const mockPermissionResult = [
        {
          permissionId: 'perm-123',
          action: 'override_price',
          resource: 'quotes',
          category: 'quotes'
        }
      ];

      const mockPolicyResult = [
        {
          id: 'policy-123',
          policy: {
            condition: 'time_window',
            start_time: '09:00',
            end_time: '17:00'
          }
        }
      ];

      mockDb.where.mockResolvedValueOnce(mockPermissionResult);
      mockDb.where.mockResolvedValueOnce(mockPolicyResult);

      const result = await permissionService.hasPermission('user-123', 'quotes.override_price');

      expect(result.hasPermission).toBe(true);
      expect(mockDb.where).toHaveBeenCalledTimes(2);
    });
  });
});
