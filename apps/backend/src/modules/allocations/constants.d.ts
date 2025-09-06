export declare const ALLOCATION_ROLES: {
    readonly DEVELOPER: "developer";
    readonly DESIGNER: "designer";
    readonly PROJECT_MANAGER: "project_manager";
    readonly BUSINESS_ANALYST: "business_analyst";
    readonly TESTER: "tester";
    readonly DEVOPS: "devops";
    readonly ARCHITECT: "architect";
    readonly CONSULTANT: "consultant";
};
export type AllocationRole = typeof ALLOCATION_ROLES[keyof typeof ALLOCATION_ROLES];
export declare const ALLOCATION_PERMISSIONS: {
    readonly CREATE: "allocations.create";
    readonly READ: "allocations.read";
    readonly UPDATE: "allocations.update";
    readonly DELETE: "allocations.delete";
    readonly VIEW_CAPACITY: "allocations.view_capacity";
};
export type AllocationPermission = typeof ALLOCATION_PERMISSIONS[keyof typeof ALLOCATION_PERMISSIONS];
export declare const ALLOCATION_METRICS: {
    readonly CREATED_TOTAL: "pivotal_allocation_created_total";
    readonly CONFLICT_CHECKS_MS: "pivotal_allocation_conflict_checks_ms";
};
//# sourceMappingURL=constants.d.ts.map