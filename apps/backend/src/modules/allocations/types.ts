import type { AllocationRole } from './constants.js';

export interface ResourceAllocation {
  id: string;
  organizationId: string;
  projectId: string;
  userId: string;
  role: AllocationRole;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  isBillable: boolean;
  notes: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
  deletedAt?: Date;
}

export interface CreateAllocationRequest {
  projectId: string;
  userId: string;
  role: AllocationRole;
  allocationPercent: number;
  startDate: string;
  endDate: string;
  isBillable?: boolean;
  notes?: Record<string, any>;
}

export interface UpdateAllocationRequest {
  role?: AllocationRole;
  allocationPercent?: number;
  startDate?: string;
  endDate?: string;
  isBillable?: boolean;
  notes?: Record<string, any>;
}

export interface AllocationFilters {
  projectId?: string;
  userId?: string;
  role?: AllocationRole;
  startDate?: string;
  endDate?: string;
  isBillable?: boolean;
}

export interface CapacitySummary {
  userId: string;
  userName: string;
  weekStart: string;
  weekEnd: string;
  plannedHours: number;
  actualHours: number;
  plannedPercent: number;
  actualPercent: number;
  variance: number;
}

export interface WeeklyCapacitySummary {
  projectId: string;
  projectName: string;
  weekStart: string;
  weekEnd: string;
  allocations: CapacitySummary[];
  totalPlannedHours: number;
  totalActualHours: number;
  totalPlannedPercent: number;
  totalActualPercent: number;
  totalVariance: number;
}

export interface AllocationConflict {
  userId: string;
  userName: string;
  conflictingAllocations: Array<{
    id: string;
    projectId: string;
    projectName: string;
    role: string;
    allocationPercent: number;
    startDate: string;
    endDate: string;
    overlapStart: string;
    overlapEnd: string;
    totalAllocation: number;
  }>;
  totalAllocation: number;
  requestedAllocation: number;
  conflictType: 'overlap' | 'exceeds_100_percent';
}
