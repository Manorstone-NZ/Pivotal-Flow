import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testUtils, testDb } from '../../../__tests__/setup.js';
import { ApprovalService } from '../service.js';
describe('Approval Service Integration', () => {
    let approvalService;
    let testOrg;
    let testUser;
    let testFastify;
    beforeEach(async () => {
        // Create test data
        testOrg = await testUtils.createTestOrganization();
        testUser = await testUtils.createTestUser({ organizationId: testOrg.id });
        testFastify = {
            db: testDb,
            log: {
                error: console.error
            }
        };
        approvalService = new ApprovalService(testDb, {
            organizationId: testOrg.id,
            userId: testUser.id
        }, testFastify);
    });
    afterEach(async () => {
        // Cleanup is handled by test infrastructure
    });
    describe('Policy Management', () => {
        it('should return default policy when no settings exist', async () => {
            const policy = await approvalService.getApprovalPolicy();
            expect(policy).toEqual({
                quoteSendRequiresApproval: false,
                invoiceIssueRequiresApproval: false,
                projectCloseRequiresApproval: false
            });
        });
    });
    describe('Approval Requirements', () => {
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
//# sourceMappingURL=routes.test.js.map