import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { AllocationService } from '../service.js';
import { ALLOCATION_ROLES } from '../constants.js';
import { testUtils, testDb } from '../../../__tests__/setup.js';
import { resourceAllocations, projects } from '../../../lib/schema.js';
import { eq } from 'drizzle-orm';

describe('AllocationService', () => {
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

  describe('Allocation Creation', () => {
    it('should reject creation without proper permissions', async () => {
      const allocationData = {
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 50,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true
      };

      await expect(allocationService.createAllocation(allocationData))
        .rejects.toThrow('User does not have permission to create allocations');
    });

    it('should detect allocation conflicts when total exceeds 100%', async () => {
      // Create an existing allocation first
      await testDb.insert(resourceAllocations).values({
        id: testUtils.generateId(),
        organizationId: testOrg.id,
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 80,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true,
        notes: {}
      });

      const newAllocationData = {
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DESIGNER,
        allocationPercent: 50, // This would make total 130%
        startDate: '2025-01-15',
        endDate: '2025-02-15',
        isBillable: true
      };

      // Mock permission check to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      await expect(allocationService.createAllocation(newAllocationData))
        .rejects.toThrow('Allocation conflicts detected');

      // Restore original service
      allocationService['permissionService'] = originalPermissionService;
    });

    it('should allow non-overlapping allocations', async () => {
      // Create an existing allocation
      await testDb.insert(resourceAllocations).values({
        id: testUtils.generateId(),
        organizationId: testOrg.id,
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 80,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true,
        notes: {}
      });

      const newAllocationData = {
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 60,
        startDate: '2025-02-01', // No overlap
        endDate: '2025-02-28',
        isBillable: true
      };

      // Mock permission check to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      const allocation = await allocationService.createAllocation(newAllocationData);

      expect(allocation).toBeDefined();
      expect(allocation.allocationPercent).toBe('60');
      expect(allocation.role).toBe(ALLOCATION_ROLES.DEVELOPER);

      // Restore original service
      allocationService['permissionService'] = originalPermissionService;
    });
  });

  describe('Allocation Updates', () => {
    let existingAllocation: any;

    beforeEach(async () => {
      existingAllocation = await testDb.insert(resourceAllocations).values({
        id: testUtils.generateId(),
        organizationId: testOrg.id,
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 50,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true,
        notes: {}
      }).returning();
    });

    it('should reject updates without proper permissions', async () => {
      const updateData = {
        allocationPercent: 75
      };

      await expect(allocationService.updateAllocation(existingAllocation[0].id, updateData))
        .rejects.toThrow('User does not have permission to update allocations');
    });

    it('should successfully update allocation with valid data', async () => {
      // Mock permission check to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      const updateData = {
        allocationPercent: 75,
        role: ALLOCATION_ROLES.ARCHITECT
      };

      const updatedAllocation = await allocationService.updateAllocation(
        existingAllocation[0].id, 
        updateData
      );

      expect(updatedAllocation.allocationPercent).toBe('75');
      expect(updatedAllocation.role).toBe(ALLOCATION_ROLES.ARCHITECT);

      // Restore original service
      allocationService['permissionService'] = originalPermissionService;
    });
  });

  describe('Allocation Deletion', () => {
    let existingAllocation: any;

    beforeEach(async () => {
      existingAllocation = await testDb.insert(resourceAllocations).values({
        id: testUtils.generateId(),
        organizationId: testOrg.id,
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 50,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true,
        notes: {}
      }).returning();
    });

    it('should reject deletion without proper permissions', async () => {
      await expect(allocationService.deleteAllocation(existingAllocation[0].id))
        .rejects.toThrow('User does not have permission to delete allocations');
    });

    it('should successfully soft delete allocation', async () => {
      // Mock permission check to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      await allocationService.deleteAllocation(existingAllocation[0].id);

      // Verify soft deletion
      const deletedAllocation = await testDb.select()
        .from(resourceAllocations)
        .where(eq(resourceAllocations.id, existingAllocation[0].id))
        .limit(1);

      expect(deletedAllocation[0].deletedAt).not.toBeNull();

      // Restore original service
      allocationService['permissionService'] = originalPermissionService;
    });
  });

  describe('Conflict Detection', () => {
    it('should detect overlapping date ranges', async () => {
      // Create first allocation: Jan 1-31
      await testDb.insert(resourceAllocations).values({
        id: testUtils.generateId(),
        organizationId: testOrg.id,
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 60,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true,
        notes: {}
      });

      // Test overlapping allocation: Jan 15 - Feb 15 (50% overlap)
      const conflicts = await allocationService['checkAllocationConflicts'](
        testUser.id,
        '2025-01-15',
        '2025-02-15',
        50
      );

      expect(conflicts).toHaveLength(1);
      expect(conflicts[0].conflictType).toBe('exceeds_100_percent');
      expect(conflicts[0].totalAllocation).toBe(110); // 60 + 50
    });

    it('should not detect conflicts for non-overlapping dates', async () => {
      // Create first allocation: Jan 1-31
      await testDb.insert(resourceAllocations).values({
        id: testUtils.generateId(),
        organizationId: testOrg.id,
        projectId: testProject[0].id,
        userId: testUser.id,
        role: ALLOCATION_ROLES.DEVELOPER,
        allocationPercent: 80,
        startDate: '2025-01-01',
        endDate: '2025-01-31',
        isBillable: true,
        notes: {}
      });

      // Test non-overlapping allocation: Feb 1-28
      const conflicts = await allocationService['checkAllocationConflicts'](
        testUser.id,
        '2025-02-01',
        '2025-02-28',
        90
      );

      expect(conflicts).toHaveLength(0);
    });

    it('should handle capacity calculations correctly', async () => {
      const startDate = new Date('2025-01-01');
      const endDate = new Date('2025-01-14'); // 2 weeks

      const allocations = [
        {
          userId: testUser.id,
          userName: 'Test User',
          allocationPercent: 50,
          startDate: '2025-01-01',
          endDate: '2025-01-07'
        },
        {
          userId: testUser.id,
          userName: 'Test User',
          allocationPercent: 75,
          startDate: '2025-01-08',
          endDate: '2025-01-14'
        }
      ];

      const capacity = allocationService['calculateWeeklyCapacity'](allocations, startDate, endDate);

      expect(capacity.length).toBeGreaterThan(0);
      expect(capacity[0].plannedHours).toBe(20); // 50% of 40-hour week
    });
  });

  describe('Query Operations', () => {
    beforeEach(async () => {
      // Create test allocations
      await testDb.insert(resourceAllocations).values([
        {
          id: testUtils.generateId(),
          organizationId: testOrg.id,
          projectId: testProject[0].id,
          userId: testUser.id,
          role: ALLOCATION_ROLES.DEVELOPER,
          allocationPercent: 50,
          startDate: '2025-01-01',
          endDate: '2025-01-31',
          isBillable: true,
          notes: {}
        },
        {
          id: testUtils.generateId(),
          organizationId: testOrg.id,
          projectId: testProject[0].id,
          userId: testApprover.id,
          role: ALLOCATION_ROLES.DESIGNER,
          allocationPercent: 75,
          startDate: '2025-02-01',
          endDate: '2025-02-28',
          isBillable: false,
          notes: {}
        }
      ]);
    });

    it('should reject queries without proper permissions', async () => {
      await expect(allocationService.getAllocations())
        .rejects.toThrow('User does not have permission to view allocations');
    });

    it('should filter allocations by project', async () => {
      // Mock permission check to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      const result = await allocationService.getAllocations({
        projectId: testProject[0].id
      });

      expect(result.allocations).toHaveLength(2);
      expect(result.total).toBe(2);

      // Restore original service
      allocationService['permissionService'] = originalPermissionService;
    });

    it('should filter allocations by billable status', async () => {
      // Mock permission check to pass
      const originalPermissionService = allocationService['permissionService'];
      allocationService['permissionService'] = {
        hasPermission: async () => ({ hasPermission: true })
      } as any;

      const result = await allocationService.getAllocations({
        isBillable: true
      });

      expect(result.allocations).toHaveLength(1);
      expect(result.allocations[0].isBillable).toBe(true);

      // Restore original service
      allocationService['permissionService'] = originalPermissionService;
    });
  });
});
