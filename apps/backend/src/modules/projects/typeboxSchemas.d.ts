export declare const ProjectStatusSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
export declare const ProjectFiltersSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    size: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    sort: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"name">, import("@sinclair/typebox").TLiteral<"status">, import("@sinclair/typebox").TLiteral<"startDate">, import("@sinclair/typebox").TLiteral<"endDate">, import("@sinclair/typebox").TLiteral<"createdAt">]>>;
    sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"asc">, import("@sinclair/typebox").TLiteral<"desc">]>>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    customerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    ownerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    serviceCategoryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const CreateProjectSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    ownerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    startDate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    endDate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export declare const UpdateProjectSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    ownerId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    startDate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    endDate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export declare const ProjectSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
    ownerId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    startDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    endDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    deletedAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
}>;
export declare const ProjectWithRelationsSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
    ownerId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    startDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    endDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    deletedAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    owner: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        firstName: import("@sinclair/typebox").TString;
        lastName: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
    }>>;
    serviceCategories: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>>;
}>;
export declare const PaginationMetaSchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TNumber;
    size: import("@sinclair/typebox").TNumber;
    total: import("@sinclair/typebox").TNumber;
    totalPages: import("@sinclair/typebox").TNumber;
    hasNext: import("@sinclair/typebox").TBoolean;
    hasPrev: import("@sinclair/typebox").TBoolean;
}>;
export declare const ProjectsListResponseSchema: import("@sinclair/typebox").TObject<{
    data: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
        ownerId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        startDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        endDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
        deletedAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>;
    meta: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        size: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
        hasNext: import("@sinclair/typebox").TBoolean;
        hasPrev: import("@sinclair/typebox").TBoolean;
    }>;
}>;
export declare const ProjectDetailResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"active">, import("@sinclair/typebox").TLiteral<"completed">, import("@sinclair/typebox").TLiteral<"on-hold">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
    ownerId: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    startDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    endDate: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    deletedAt: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    owner: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        firstName: import("@sinclair/typebox").TString;
        lastName: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
    }>>;
    serviceCategories: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        code: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    }>>>;
}>;
export declare const ProjectErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TAny>>;
}>;
export type ProjectFilters = typeof ProjectFiltersSchema.static;
export type CreateProject = typeof CreateProjectSchema.static;
export type UpdateProject = typeof UpdateProjectSchema.static;
export type Project = typeof ProjectSchema.static;
export type ProjectWithRelations = typeof ProjectWithRelationsSchema.static;
export type ProjectsListResponse = typeof ProjectsListResponseSchema.static;
export type ProjectDetailResponse = typeof ProjectDetailResponseSchema.static;
export type ProjectError = typeof ProjectErrorSchema.static;
export type PaginationMeta = typeof PaginationMetaSchema.static;
//# sourceMappingURL=typeboxSchemas.d.ts.map