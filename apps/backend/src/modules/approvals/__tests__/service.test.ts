import { describe, it, expect, beforeEach, afterEach } from 'vitest';

import { testUtils, testDb } from '../../../__tests__/setup.js';
import { ApprovalService } from '../service.js';

describe('ApprovalService', () => {
  let approvalService: ApprovalService;
  let testOrg: any;
  let testUser: any;
  let testFastify: any;

  beforeEach(async () => {
    // Use existing test infrastructure
    testFastify = {
      db: testDb,
      log: {
        error: console.error
      }
    };

    // Create test organization and users
    testOrg = await testUtils.createTestOrganization();
    testUser = await testUtils.createTestUser({ organizationId: testOrg.id });

    approvalService = new ApprovalService(testDb, {
      organizationId: testOrg.id,
      userId: testUser.id
    }, testFastify);
  });

  afterEach(async () => {
    // Cleanup is handled by test infrastructure
  });

  describe('getApprovalPolicy', () => {
    it('should return default policy when no settings exist', async () => {
      const policy = await approvalService.getApprovalPolicy();

      expect(policy).toEqual({
        quoteSendRequiresApproval: false,
        invoiceIssueRequiresApproval: false,
        projectCloseRequiresApproval: false
      });
    });
  });

  describe('requiresApproval', () => {
    it('should return false when policy does not require approval', async () => {
      const requiresApproval = await approvalService.requiresApproval('quote', 'send');
      expect(requiresApproval).toBe(false);
    });

    it('should return false for unknown entity types', async () => {
      const requiresApproval = await approvalService.requiresApproval('unknown', 'action');
      expect(requiresApproval).toBe(false);
    });
  });
});
