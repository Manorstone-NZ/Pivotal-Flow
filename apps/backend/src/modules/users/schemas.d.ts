import { z } from 'zod';
export declare const userCreateSchema: z.ZodObject<{
    email: z.ZodString;
    firstName: z.ZodString;
    lastName: z.ZodString;
    displayName: z.ZodOptional<z.ZodString>;
    phone: z.ZodOptional<z.ZodString>;
    timezone: z.ZodOptional<z.ZodString>;
    locale: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    timezone?: string | undefined;
    displayName?: string | undefined;
    locale?: string | undefined;
}, {
    email: string;
    firstName: string;
    lastName: string;
    phone?: string | undefined;
    timezone?: string | undefined;
    displayName?: string | undefined;
    locale?: string | undefined;
}>;
export declare const userUpdateSchema: z.ZodObject<{
    displayName: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
}, "strict", z.ZodTypeAny, {
    isActive?: boolean | undefined;
    displayName?: string | undefined;
}, {
    isActive?: boolean | undefined;
    displayName?: string | undefined;
}>;
export declare const userListFiltersSchema: z.ZodObject<{
    q: z.ZodOptional<z.ZodString>;
    isActive: z.ZodOptional<z.ZodBoolean>;
    roleId: z.ZodOptional<z.ZodString>;
}, "strict", z.ZodTypeAny, {
    roleId?: string | undefined;
    isActive?: boolean | undefined;
    q?: string | undefined;
}, {
    roleId?: string | undefined;
    isActive?: boolean | undefined;
    q?: string | undefined;
}>;
export declare const userListSortSchema: z.ZodObject<{
    field: z.ZodDefault<z.ZodEnum<["email", "createdAt"]>>;
    direction: z.ZodDefault<z.ZodEnum<["asc", "desc"]>>;
}, "strict", z.ZodTypeAny, {
    field: "createdAt" | "email";
    direction: "asc" | "desc";
}, {
    field?: "createdAt" | "email" | undefined;
    direction?: "asc" | "desc" | undefined;
}>;
export declare const paginationSchema: z.ZodObject<{
    page: z.ZodDefault<z.ZodNumber>;
    pageSize: z.ZodDefault<z.ZodNumber>;
}, "strict", z.ZodTypeAny, {
    page: number;
    pageSize: number;
}, {
    page?: number | undefined;
    pageSize?: number | undefined;
}>;
export declare const roleAssignmentSchema: z.ZodObject<{
    roleId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    roleId: string;
}, {
    roleId: string;
}>;
export declare const userStatusSchema: z.ZodObject<{
    isActive: z.ZodBoolean;
}, "strict", z.ZodTypeAny, {
    isActive: boolean;
}, {
    isActive: boolean;
}>;
export declare const userIdParamSchema: z.ZodObject<{
    id: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: string;
}, {
    id: string;
}>;
export declare const roleIdParamSchema: z.ZodObject<{
    id: z.ZodString;
    roleId: z.ZodString;
}, "strict", z.ZodTypeAny, {
    id: string;
    roleId: string;
}, {
    id: string;
    roleId: string;
}>;
export declare const userResponseSchema: z.ZodObject<{
    id: z.ZodString;
    email: z.ZodString;
    displayName: z.ZodNullable<z.ZodString>;
    isActive: z.ZodBoolean;
    mfaEnabled: z.ZodBoolean;
    createdAt: z.ZodDate;
    roles: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        name: z.ZodString;
        description: z.ZodNullable<z.ZodString>;
        isSystem: z.ZodBoolean;
        isActive: z.ZodBoolean;
    }, "strip", z.ZodTypeAny, {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        isSystem: boolean;
    }, {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        isSystem: boolean;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    id: string;
    createdAt: Date;
    isActive: boolean;
    email: string;
    roles: {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        isSystem: boolean;
    }[];
    displayName: string | null;
    mfaEnabled: boolean;
}, {
    id: string;
    createdAt: Date;
    isActive: boolean;
    email: string;
    roles: {
        id: string;
        name: string;
        description: string | null;
        isActive: boolean;
        isSystem: boolean;
    }[];
    displayName: string | null;
    mfaEnabled: boolean;
}>;
export declare const userListResponseSchema: z.ZodObject<{
    items: z.ZodArray<z.ZodObject<{
        id: z.ZodString;
        email: z.ZodString;
        displayName: z.ZodNullable<z.ZodString>;
        isActive: z.ZodBoolean;
        mfaEnabled: z.ZodBoolean;
        createdAt: z.ZodDate;
        roles: z.ZodArray<z.ZodObject<{
            id: z.ZodString;
            name: z.ZodString;
            description: z.ZodNullable<z.ZodString>;
            isSystem: z.ZodBoolean;
            isActive: z.ZodBoolean;
        }, "strip", z.ZodTypeAny, {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        }, {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        }>, "many">;
    }, "strip", z.ZodTypeAny, {
        id: string;
        createdAt: Date;
        isActive: boolean;
        email: string;
        roles: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        }[];
        displayName: string | null;
        mfaEnabled: boolean;
    }, {
        id: string;
        createdAt: Date;
        isActive: boolean;
        email: string;
        roles: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        }[];
        displayName: string | null;
        mfaEnabled: boolean;
    }>, "many">;
    page: z.ZodNumber;
    pageSize: z.ZodNumber;
    total: z.ZodNumber;
    totalPages: z.ZodNumber;
}, "strip", z.ZodTypeAny, {
    page: number;
    pageSize: number;
    items: {
        id: string;
        createdAt: Date;
        isActive: boolean;
        email: string;
        roles: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        }[];
        displayName: string | null;
        mfaEnabled: boolean;
    }[];
    total: number;
    totalPages: number;
}, {
    page: number;
    pageSize: number;
    items: {
        id: string;
        createdAt: Date;
        isActive: boolean;
        email: string;
        roles: {
            id: string;
            name: string;
            description: string | null;
            isActive: boolean;
            isSystem: boolean;
        }[];
        displayName: string | null;
        mfaEnabled: boolean;
    }[];
    total: number;
    totalPages: number;
}>;
export declare const successResponseSchema: z.ZodObject<{
    success: z.ZodBoolean;
    message: z.ZodString;
}, "strip", z.ZodTypeAny, {
    message: string;
    success: boolean;
}, {
    message: string;
    success: boolean;
}>;
export declare const errorResponseSchema: z.ZodObject<{
    error: z.ZodString;
    message: z.ZodString;
    code: z.ZodOptional<z.ZodString>;
    details: z.ZodOptional<z.ZodUnknown>;
}, "strip", z.ZodTypeAny, {
    error: string;
    message: string;
    code?: string | undefined;
    details?: unknown;
}, {
    error: string;
    message: string;
    code?: string | undefined;
    details?: unknown;
}>;
export declare const validationErrorSchema: z.ZodObject<{
    error: z.ZodLiteral<"Validation Error">;
    message: z.ZodString;
    code: z.ZodLiteral<"VALIDATION_ERROR">;
    details: z.ZodArray<z.ZodObject<{
        field: z.ZodString;
        message: z.ZodString;
    }, "strip", z.ZodTypeAny, {
        message: string;
        field: string;
    }, {
        message: string;
        field: string;
    }>, "many">;
}, "strip", z.ZodTypeAny, {
    code: "VALIDATION_ERROR";
    error: "Validation Error";
    message: string;
    details: {
        message: string;
        field: string;
    }[];
}, {
    code: "VALIDATION_ERROR";
    error: "Validation Error";
    message: string;
    details: {
        message: string;
        field: string;
    }[];
}>;
export type UserCreateInput = z.infer<typeof userCreateSchema>;
export type UserUpdateInput = z.infer<typeof userUpdateSchema>;
export type UserListFiltersInput = z.infer<typeof userListFiltersSchema>;
export type UserListSortInput = z.infer<typeof userListSortSchema>;
export type PaginationInput = z.infer<typeof paginationSchema>;
export type RoleAssignmentInput = z.infer<typeof roleAssignmentSchema>;
export type UserStatusInput = z.infer<typeof userStatusSchema>;
export type UserIdParam = z.infer<typeof userIdParamSchema>;
export type RoleIdParam = z.infer<typeof roleIdParamSchema>;
//# sourceMappingURL=schemas.d.ts.map