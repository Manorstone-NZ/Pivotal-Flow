import { type Static } from '@sinclair/typebox';
export declare const UserCreateSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString;
    firstName: import("@sinclair/typebox").TString;
    lastName: import("@sinclair/typebox").TString;
    displayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    locale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type UserCreate = Static<typeof UserCreateSchema>;
export declare const UserUpdateSchema: import("@sinclair/typebox").TObject<{
    displayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type UserUpdate = Static<typeof UserUpdateSchema>;
export declare const UserListFiltersSchema: import("@sinclair/typebox").TObject<{
    q: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    roleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export type UserListFilters = Static<typeof UserListFiltersSchema>;
export declare const UserListSortSchema: import("@sinclair/typebox").TObject<{
    field: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"email">, import("@sinclair/typebox").TLiteral<"createdAt">]>;
    direction: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>;
}>;
export type UserListSort = Static<typeof UserListSortSchema>;
export declare const UserResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    email: import("@sinclair/typebox").TString;
    firstName: import("@sinclair/typebox").TString;
    lastName: import("@sinclair/typebox").TString;
    displayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    locale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TBoolean;
    roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
    organizationId: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type UserResponse = Static<typeof UserResponseSchema>;
export declare const UserListResponseSchema: import("@sinclair/typebox").TObject<{
    users: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        firstName: import("@sinclair/typebox").TString;
        lastName: import("@sinclair/typebox").TString;
        displayName: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        phone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timezone: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        locale: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        isActive: import("@sinclair/typebox").TBoolean;
        roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        }>>;
        organizationId: import("@sinclair/typebox").TString;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        limit: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
    }>;
}>;
export type UserListResponse = Static<typeof UserListResponseSchema>;
export declare const UserErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type UserError = Static<typeof UserErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map