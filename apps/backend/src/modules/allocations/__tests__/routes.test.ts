import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { testUtils, testDb } from '../../../__tests__/setup.js';
import { AllocationService } from '../service.js';
import { ALLOCATION_ROLES } from '../constants.js';
import { resourceAllocations, projects, users } from '../../../lib/schema.js';

describe('Allocation Service Integration', () => {
  let allocationService: AllocationService;
  let testOrg: any;
  let testUser: any;
  let testApprover: any;
  let testProject: any;
  let testFastify: any;

  beforeEach(async () => {
    testOrg = await testUtils.createTestOrganization();
    testUser = await testUtils.createTestUser({ organizationId: testOrg.id });
    testApprover = await testUtils.createTestUser({ 
      organizationId: testOrg.id,
      email: 'approver@example.com'
    });

    // Create a test project
    testProject = await testDb.insert(projects).values({
      id: testUtils.generateId(),
      organizationId: testOrg.id,
      name: 'Test Project',
      status: 'active'
    }).returning();

    testFastify = {
      db: testDb,
      log: {
        error: console.error
      }
    };

    allocationService = new AllocationService(testDb, {
      organizationId: testOrg.id,
      userId: testUser.id
    }, testFastify);
  });

  afterEach(async () => {
    // Cleanup is handled by test infrastructure
  });

  describe('End-to-End Allocation Workflow', () => {
    it('should handle complete allocation lifecycle', async () => {
      // Mock permission checks to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      try {
        // 1. Create allocation
        const allocationData = {
          projectId: testProject[0].id,
          userId: testUser.id,
          role: ALLOCATION_ROLES.DEVELOPER,
          allocationPercent: 50,
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          isBillable: true,
          notes: { comment: 'Initial allocation' }
        };

        const createdAllocation = await allocationService.createAllocation(allocationData);
        expect(createdAllocation).toBeDefined();
        expect(createdAllocation.allocationPercent).toBe('50');

        // 2. Update allocation
        const updateData = {
          allocationPercent: 75,
          role: ALLOCATION_ROLES.ARCHITECT,
          notes: { comment: 'Updated allocation' }
        };

        const updatedAllocation = await allocationService.updateAllocation(
          createdAllocation.id,
          updateData
        );
        expect(updatedAllocation.allocationPercent).toBe('75');
        expect(updatedAllocation.role).toBe(ALLOCATION_ROLES.ARCHITECT);

        // 3. Get allocation by ID
        const retrievedAllocation = await allocationService.getAllocation(createdAllocation.id);
        expect(retrievedAllocation.id).toBe(createdAllocation.id);
        expect(retrievedAllocation.allocationPercent).toBe('75');

        // 4. List allocations with filters
        const allocationsList = await allocationService.getAllocations({
          projectId: testProject[0].id,
          role: ALLOCATION_ROLES.ARCHITECT
        });
        expect(allocationsList.allocations).toHaveLength(1);
        expect(allocationsList.allocations[0].role).toBe(ALLOCATION_ROLES.ARCHITECT);

        // 5. Delete allocation
        await allocationService.deleteAllocation(createdAllocation.id);

        // 6. Verify deletion
        await expect(allocationService.getAllocation(createdAllocation.id))
          .rejects.toThrow('Allocation not found');

      } finally {
        // Restore original service
        allocationService['permissionService'] = originalPermissionService;
      }
    });

    it('should handle conflict detection in real scenarios', async () => {
      // Mock permission checks to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      try {
        // Create first allocation: 80% for January
        const firstAllocation = {
          projectId: testProject[0].id,
          userId: testUser.id,
          role: ALLOCATION_ROLES.DEVELOPER,
          allocationPercent: 80,
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          isBillable: true
        };

        await allocationService.createAllocation(firstAllocation);

        // Try to create overlapping allocation: 50% for Jan 15 - Feb 15
        const conflictingAllocation = {
          projectId: testProject[0].id,
          userId: testUser.id,
          role: ALLOCATION_ROLES.DESIGNER,
          allocationPercent: 50,
          startDate: '2025-01-15',
          endDate: '2025-02-15',
          isBillable: true
        };

        await expect(allocationService.createAllocation(conflictingAllocation))
          .rejects.toThrow('Allocation conflicts detected');

        // Create non-conflicting allocation: 50% for March
        const nonConflictingAllocation = {
          projectId: testProject[0].id,
          userId: testUser.id,
          role: ALLOCATION_ROLES.DESIGNER,
          allocationPercent: 50,
          startDate: '2025-03-01',
          endDate: '2025-03-31',
          isBillable: true
        };

        const created = await allocationService.createAllocation(nonConflictingAllocation);
        expect(created).toBeDefined();

      } finally {
        // Restore original service
        allocationService['permissionService'] = originalPermissionService;
      }
    });

    it('should calculate project capacity correctly', async () => {
      // Mock permission checks to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      try {
        // Create multiple allocations for capacity testing
        const allocations = [
          {
            projectId: testProject[0].id,
            userId: testUser.id,
            role: ALLOCATION_ROLES.DEVELOPER,
            allocationPercent: 50,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            isBillable: true
          },
          {
            projectId: testProject[0].id,
            userId: testApprover.id,
            role: ALLOCATION_ROLES.DESIGNER,
            allocationPercent: 75,
            startDate: '2025-01-01',
            endDate: '2025-01-31',
            isBillable: true
          }
        ];

        for (const allocation of allocations) {
          await allocationService.createAllocation(allocation);
        }

        // Get capacity summary
        const capacity = await allocationService.getProjectCapacity(testProject[0].id, 4);
        
        expect(capacity).toBeDefined();
        expect(capacity.projectId).toBe(testProject[0].id);
        expect(capacity.projectName).toBe('Test Project');
        expect(capacity.allocations.length).toBeGreaterThan(0);

        // Check that planned hours are calculated correctly
        const totalPlannedPercent = capacity.allocations.reduce(
          (sum, alloc) => sum + alloc.plannedPercent, 
          0
        );
        expect(totalPlannedPercent).toBeGreaterThan(0);

      } finally {
        // Restore original service
        allocationService['permissionService'] = originalPermissionService;
      }
    });

    it('should handle edge cases gracefully', async () => {
      // Mock permission checks to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      try {
        // Test with non-existent project
        await expect(allocationService.getProjectCapacity('non-existent-project'))
          .rejects.toThrow('Project not found');

        // Test with non-existent allocation
        await expect(allocationService.getAllocation('non-existent-allocation'))
          .rejects.toThrow('Allocation not found');

        // Test with non-existent allocation for update
        await expect(allocationService.updateAllocation('non-existent-allocation', {
          allocationPercent: 50
        })).rejects.toThrow('Allocation not found');

        // Test with non-existent allocation for delete
        await expect(allocationService.deleteAllocation('non-existent-allocation'))
          .rejects.toThrow('Allocation not found');

      } finally {
        // Restore original service
        allocationService['permissionService'] = originalPermissionService;
      }
    });

    it('should handle pagination correctly', async () => {
      // Mock permission checks to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      try {
        // Create multiple allocations
        const allocations = [];
        for (let i = 0; i < 5; i++) {
          allocations.push({
            projectId: testProject[0].id,
            userId: testUser.id,
            role: ALLOCATION_ROLES.DEVELOPER,
            allocationPercent: 20,
            startDate: `2025-0${i + 1}-01`,
            endDate: `2025-0${i + 1}-28`,
            isBillable: true
          });
        }

        for (const allocation of allocations) {
          await allocationService.createAllocation(allocation);
        }

        // Test pagination
        const page1 = await allocationService.getAllocations({}, 1, 2);
        expect(page1.allocations).toHaveLength(2);
        expect(page1.total).toBe(5);

        const page2 = await allocationService.getAllocations({}, 2, 2);
        expect(page2.allocations).toHaveLength(2);
        expect(page2.total).toBe(5);

        const page3 = await allocationService.getAllocations({}, 3, 2);
        expect(page3.allocations).toHaveLength(1);
        expect(page3.total).toBe(5);

      } finally {
        // Restore original service
        allocationService['permissionService'] = originalPermissionService;
      }
    });
  });

  describe('Performance Tests', () => {
    it('should handle conflict checks within performance threshold', async () => {
      // Mock permission checks to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      try {
        // Create some existing allocations to test against
        for (let i = 0; i < 10; i++) {
          await testDb.insert(resourceAllocations).values({
            id: testUtils.generateId(),
            organizationId: testOrg.id,
            projectId: testProject[0].id,
            userId: testUser.id,
            role: ALLOCATION_ROLES.DEVELOPER,
            allocationPercent: 10,
            startDate: `2025-${String(i + 1).padStart(2, '0')}-01`,
            endDate: `2025-${String(i + 1).padStart(2, '0')}-28`,
            isBillable: true,
            notes: {}
          });
        }

        // Measure conflict check performance
        const startTime = Date.now();
        const conflicts = await allocationService['checkAllocationConflicts'](
          testUser.id,
          '2025-01-15',
          '2025-12-15',
          50
        );
        const duration = Date.now() - startTime;

        // Should complete within 50ms as per requirements
        expect(duration).toBeLessThan(50);
        expect(conflicts).toBeDefined();

      } finally {
        // Restore original service
        allocationService['permissionService'] = originalPermissionService;
      }
    });
  });
});
