import type { FastifyInstance } from 'fastify';
import type { CreateAllocationRequest, UpdateAllocationRequest, AllocationFilters, WeeklyCapacitySummary } from './types.js';
interface AllocationQueryResult {
    id: string;
    userId: string;
    projectId: string;
    role: string;
    allocationPercent: number;
    startDate: Date;
    endDate: Date;
    isBillable: boolean;
    notes: string | null;
    createdAt: Date;
    updatedAt: Date;
    userName: string | null;
    projectName: string | null;
}
export declare class AllocationService {
    private organizationId;
    private userId;
    private db;
    private permissionService;
    private auditLogger;
    constructor(organizationId: string, userId: string, fastify: FastifyInstance);
    createAllocation(data: CreateAllocationRequest): Promise<any>;
    updateAllocation(id: string, data: UpdateAllocationRequest): Promise<any>;
    deleteAllocation(id: string): Promise<void>;
    getAllocations(filters?: AllocationFilters, page?: number, limit?: number): Promise<{
        allocations: AllocationQueryResult[];
        total: number;
    }>;
    getAllocation(id: string): Promise<any>;
    getProjectCapacity(projectId: string, weeks?: number): Promise<WeeklyCapacitySummary>;
    private checkAllocationConflicts;
    private calculateWeeklyCapacity;
}
export {};
//# sourceMappingURL=service.d.ts.map