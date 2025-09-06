import { z } from 'zod';
export declare const CreateAllocationRequestSchema: z.ZodEffects<z.ZodObject<{
    projectId: z.ZodString;
    userId: z.ZodString;
    role: z.ZodEnum<[string, ...string[]]>;
    allocationPercent: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodString;
    isBillable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    notes: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}, {
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    role: string;
    allocationPercent: number;
    notes?: Record<string, any> | undefined;
    isBillable?: boolean | undefined;
}>, {
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}, {
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    role: string;
    allocationPercent: number;
    notes?: Record<string, any> | undefined;
    isBillable?: boolean | undefined;
}>;
export declare const CreateAllocationBodySchema: z.ZodEffects<z.ZodObject<{
    userId: z.ZodString;
    role: z.ZodEnum<[string, ...string[]]>;
    allocationPercent: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodString;
    isBillable: z.ZodDefault<z.ZodOptional<z.ZodBoolean>>;
    notes: z.ZodDefault<z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    startDate: string;
    endDate: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}, {
    userId: string;
    startDate: string;
    endDate: string;
    role: string;
    allocationPercent: number;
    notes?: Record<string, any> | undefined;
    isBillable?: boolean | undefined;
}>, {
    userId: string;
    startDate: string;
    endDate: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}, {
    userId: string;
    startDate: string;
    endDate: string;
    role: string;
    allocationPercent: number;
    notes?: Record<string, any> | undefined;
    isBillable?: boolean | undefined;
}>;
export declare const UpdateAllocationRequestSchema: z.ZodEffects<z.ZodObject<{
    role: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    allocationPercent: z.ZodOptional<z.ZodNumber>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    isBillable: z.ZodOptional<z.ZodBoolean>;
    notes: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodAny>>;
}, "strip", z.ZodTypeAny, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: Record<string, any> | undefined;
    role?: string | undefined;
    allocationPercent?: number | undefined;
    isBillable?: boolean | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: Record<string, any> | undefined;
    role?: string | undefined;
    allocationPercent?: number | undefined;
    isBillable?: boolean | undefined;
}>, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: Record<string, any> | undefined;
    role?: string | undefined;
    allocationPercent?: number | undefined;
    isBillable?: boolean | undefined;
}, {
    startDate?: string | undefined;
    endDate?: string | undefined;
    notes?: Record<string, any> | undefined;
    role?: string | undefined;
    allocationPercent?: number | undefined;
    isBillable?: boolean | undefined;
}>;
export declare const AllocationFiltersSchema: z.ZodObject<{
    projectId: z.ZodOptional<z.ZodString>;
    userId: z.ZodOptional<z.ZodString>;
    role: z.ZodOptional<z.ZodEnum<[string, ...string[]]>>;
    startDate: z.ZodOptional<z.ZodString>;
    endDate: z.ZodOptional<z.ZodString>;
    isBillable: z.ZodOptional<z.ZodBoolean>;
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    userId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectId?: string | undefined;
    role?: string | undefined;
    isBillable?: boolean | undefined;
}, {
    userId?: string | undefined;
    startDate?: string | undefined;
    endDate?: string | undefined;
    projectId?: string | undefined;
    role?: string | undefined;
    isBillable?: boolean | undefined;
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const ResourceAllocationResponseSchema: z.ZodObject<{
    id: z.ZodString;
    organizationId: z.ZodString;
    projectId: z.ZodString;
    userId: z.ZodString;
    role: z.ZodString;
    allocationPercent: z.ZodNumber;
    startDate: z.ZodString;
    endDate: z.ZodString;
    isBillable: z.ZodBoolean;
    notes: z.ZodRecord<z.ZodString, z.ZodAny>;
    createdAt: z.ZodString;
    updatedAt: z.ZodString;
    deletedAt: z.ZodNullable<z.ZodString>;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    deletedAt: string | null;
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}, {
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    deletedAt: string | null;
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}>;
export declare const ListAllocationsResponseSchema: z.ZodObject<{
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
} & {
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        organizationId: z.ZodString;
        projectId: z.ZodString;
        userId: z.ZodString;
        role: z.ZodString;
        allocationPercent: z.ZodNumber;
        startDate: z.ZodString;
        endDate: z.ZodString;
        isBillable: z.ZodBoolean;
        notes: z.ZodRecord<z.ZodString, z.ZodAny>;
        createdAt: z.ZodString;
        updatedAt: z.ZodString;
        deletedAt: z.ZodNullable<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        deletedAt: string | null;
        userId: string;
        startDate: string;
        endDate: string;
        projectId: string;
        notes: Record<string, any>;
        role: string;
        allocationPercent: number;
        isBillable: boolean;
    }, {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        deletedAt: string | null;
        userId: string;
        startDate: string;
        endDate: string;
        projectId: string;
        notes: Record<string, any>;
        role: string;
        allocationPercent: number;
        isBillable: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    items: {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        deletedAt: string | null;
        userId: string;
        startDate: string;
        endDate: string;
        projectId: string;
        notes: Record<string, any>;
        role: string;
        allocationPercent: number;
        isBillable: boolean;
    }[];
    total: number;
    totalPages: number;
}, {
    page: number;
    pageSize: number;
    items: {
        id: string;
        createdAt: string;
        updatedAt: string;
        organizationId: string;
        deletedAt: string | null;
        userId: string;
        startDate: string;
        endDate: string;
        projectId: string;
        notes: Record<string, any>;
        role: string;
        allocationPercent: number;
        isBillable: boolean;
    }[];
    total: number;
    totalPages: number;
}>;
export declare const createAllocationsPagingResponse: (allocations: z.infer<typeof ResourceAllocationResponseSchema>[], page: number, pageSize: number, total: number) => import("@pivotal-flow/shared").PagingResponse<{
    id: string;
    createdAt: string;
    updatedAt: string;
    organizationId: string;
    deletedAt: string | null;
    userId: string;
    startDate: string;
    endDate: string;
    projectId: string;
    notes: Record<string, any>;
    role: string;
    allocationPercent: number;
    isBillable: boolean;
}>;
export declare const CapacitySummarySchema: z.ZodObject<{
    userId: z.ZodString;
    userName: z.ZodString;
    weekStart: z.ZodString;
    weekEnd: z.ZodString;
    plannedHours: z.ZodNumber;
    actualHours: z.ZodNumber;
    plannedPercent: z.ZodNumber;
    actualPercent: z.ZodNumber;
    variance: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    userId: string;
    userName: string;
    weekStart: string;
    weekEnd: string;
    plannedHours: number;
    actualHours: number;
    plannedPercent: number;
    actualPercent: number;
    variance: number;
}, {
    userId: string;
    userName: string;
    weekStart: string;
    weekEnd: string;
    plannedHours: number;
    actualHours: number;
    plannedPercent: number;
    actualPercent: number;
    variance: number;
}>;
export declare const WeeklyCapacitySummarySchema: z.ZodObject<{
    projectId: z.ZodString;
    projectName: z.ZodString;
    weekStart: z.ZodString;
    weekEnd: z.ZodString;
    allocations: z.ZodArray<z.ZodObject<{
        userId: z.ZodString;
        userName: z.ZodString;
        weekStart: z.ZodString;
        weekEnd: z.ZodString;
        plannedHours: z.ZodNumber;
        actualHours: z.ZodNumber;
        plannedPercent: z.ZodNumber;
        actualPercent: z.ZodNumber;
        variance: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        userId: string;
        userName: string;
        weekStart: string;
        weekEnd: string;
        plannedHours: number;
        actualHours: number;
        plannedPercent: number;
        actualPercent: number;
        variance: number;
    }, {
        userId: string;
        userName: string;
        weekStart: string;
        weekEnd: string;
        plannedHours: number;
        actualHours: number;
        plannedPercent: number;
        actualPercent: number;
        variance: number;
    }>, "many">;
    totalPlannedHours: z.ZodNumber;
    totalActualHours: z.ZodNumber;
    totalPlannedPercent: z.ZodNumber;
    totalActualPercent: z.ZodNumber;
    totalVariance: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    projectId: string;
    weekStart: string;
    weekEnd: string;
    projectName: string;
    allocations: {
        userId: string;
        userName: string;
        weekStart: string;
        weekEnd: string;
        plannedHours: number;
        actualHours: number;
        plannedPercent: number;
        actualPercent: number;
        variance: number;
    }[];
    totalPlannedHours: number;
    totalActualHours: number;
    totalPlannedPercent: number;
    totalActualPercent: number;
    totalVariance: number;
}, {
    projectId: string;
    weekStart: string;
    weekEnd: string;
    projectName: string;
    allocations: {
        userId: string;
        userName: string;
        weekStart: string;
        weekEnd: string;
        plannedHours: number;
        actualHours: number;
        plannedPercent: number;
        actualPercent: number;
        variance: number;
    }[];
    totalPlannedHours: number;
    totalActualHours: number;
    totalPlannedPercent: number;
    totalActualPercent: number;
    totalVariance: number;
}>;
export declare const AllocationConflictSchema: z.ZodObject<{
    userId: z.ZodString;
    userName: z.ZodString;
    conflictingAllocations: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        projectId: z.ZodString;
        projectName: z.ZodString;
        role: z.ZodString;
        allocationPercent: z.ZodNumber;
        startDate: z.ZodString;
        endDate: z.ZodString;
        overlapStart: z.ZodString;
        overlapEnd: z.ZodString;
        totalAllocation: z.ZodNumber;
    }, "strip", z.ZodTypeAny, {
        id: string;
        startDate: string;
        endDate: string;
        projectId: string;
        role: string;
        allocationPercent: number;
        projectName: string;
        overlapStart: string;
        overlapEnd: string;
        totalAllocation: number;
    }, {
        id: string;
        startDate: string;
        endDate: string;
        projectId: string;
        role: string;
        allocationPercent: number;
        projectName: string;
        overlapStart: string;
        overlapEnd: string;
        totalAllocation: number;
    }>, "many">;
    totalAllocation: z.ZodNumber;
    requestedAllocation: z.ZodNumber;
    conflictType: z.ZodEnum<["overlap", "exceeds_100_percent"]>;
}, "strip", z.ZodTypeAny, {
    userId: string;
    userName: string;
    conflictingAllocations: {
        id: string;
        startDate: string;
        endDate: string;
        projectId: string;
        role: string;
        allocationPercent: number;
        projectName: string;
        overlapStart: string;
        overlapEnd: string;
        totalAllocation: number;
    }[];
    totalAllocation: number;
    requestedAllocation: number;
    conflictType: "overlap" | "exceeds_100_percent";
}, {
    userId: string;
    userName: string;
    conflictingAllocations: {
        id: string;
        startDate: string;
        endDate: string;
        projectId: string;
        role: string;
        allocationPercent: number;
        projectName: string;
        overlapStart: string;
        overlapEnd: string;
        totalAllocation: number;
    }[];
    totalAllocation: number;
    requestedAllocation: number;
    conflictType: "overlap" | "exceeds_100_percent";
}>;
//# sourceMappingURL=schemas.d.ts.map