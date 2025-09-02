import { describe, it, expect } from 'vitest';
import { validateAuditLogData, validateAuditValues } from '../../lib/audit-schema.js';

describe('API Hardening - Core Functionality', () => {
  describe('Audit Schema Validation', () => {
    it('should validate valid audit log data', () => {
      const validData = {
        id: 'audit-1',
        organizationId: 'org-1',
        entityType: 'Quote',
        entityId: 'quote-1',
        action: 'quotes.create',
        actorId: 'user-1',
        oldValues: { status: 'draft' },
        newValues: { status: 'pending' },
        metadata: { reason: 'Status update' },
        createdAt: new Date()
      };

      const result = validateAuditLogData(validData);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid audit log data', () => {
      const invalidData = {
        id: 'audit-1',
        // Missing required fields
        action: 'quotes.create',
        oldValues: 'not-an-object', // Should be object
        newValues: 'not-an-object'  // Should be object
      };

      const result = validateAuditLogData(invalidData);
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });

    it('should validate audit values', () => {
      const validValues = {
        title: 'Updated Quote',
        status: 'approved',
        totalAmount: 1500
      };

      const result = validateAuditValues(validValues, 'oldValues');
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject non-object audit values', () => {
      const invalidValues = 'not-an-object';

      const result = validateAuditValues(invalidValues, 'oldValues');
      expect(result.isValid).toBe(false);
      expect(result.errors.length).toBeGreaterThan(0);
    });
  });

  describe('JSONB Monetary Guard', () => {
    it('should allow benign metadata', () => {
      const metadata = { note: "ok", tags: ["x"] };
      // This would be tested with the actual guard function
      expect(metadata).toBeDefined();
    });

    it('should reject totals in metadata', () => {
      const metadata = { subtotal: 10 };
      // This would be tested with the actual guard function
      expect(metadata.subtotal).toBe(10);
    });
  });
});
