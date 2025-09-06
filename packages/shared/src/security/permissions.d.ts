/**
 * Permission checking interface and implementation
 * Provides role-based access control functionality
 */
export interface PermissionChecker {
    has(permission: string): boolean;
}
export declare class PermissionService implements PermissionChecker {
    private readonly roles;
    constructor(roles?: ReadonlyArray<string>);
    has(permission: string): boolean;
}
//# sourceMappingURL=permissions.d.ts.map