import { Type } from '@sinclair/typebox';
// Project status enum
export const ProjectStatusSchema = Type.Union([
    Type.Literal('active'),
    Type.Literal('completed'),
    Type.Literal('on-hold'),
    Type.Literal('cancelled')
]);
// Project filters schema
export const ProjectFiltersSchema = Type.Object({
    page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
    size: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 25 })),
    sort: Type.Optional(Type.Union([
        Type.Literal('name'),
        Type.Literal('status'),
        Type.Literal('startDate'),
        Type.Literal('endDate'),
        Type.Literal('createdAt')
    ], { default: 'createdAt' })),
    sortOrder: Type.Optional(Type.Union([
        Type.Literal('asc'),
        Type.Literal('desc')
    ], { default: 'desc' })),
    search: Type.Optional(Type.String()),
    status: Type.Optional(ProjectStatusSchema),
    customerId: Type.Optional(Type.String()),
    ownerId: Type.Optional(Type.String()),
    serviceCategoryId: Type.Optional(Type.String())
});
// Create project schema
export const CreateProjectSchema = Type.Object({
    name: Type.String({ minLength: 1, maxLength: 255 }),
    code: Type.Optional(Type.String({ maxLength: 50 })),
    description: Type.Optional(Type.String()),
    status: Type.Optional(ProjectStatusSchema),
    ownerId: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String({ format: 'date' })),
    endDate: Type.Optional(Type.String({ format: 'date' })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Any()))
});
// Update project schema
export const UpdateProjectSchema = Type.Object({
    name: Type.Optional(Type.String({ minLength: 1, maxLength: 255 })),
    code: Type.Optional(Type.String({ maxLength: 50 })),
    description: Type.Optional(Type.String()),
    status: Type.Optional(ProjectStatusSchema),
    ownerId: Type.Optional(Type.String()),
    startDate: Type.Optional(Type.String({ format: 'date' })),
    endDate: Type.Optional(Type.String({ format: 'date' })),
    metadata: Type.Optional(Type.Record(Type.String(), Type.Any()))
});
// Project response schema
export const ProjectSchema = Type.Object({
    id: Type.String(),
    organizationId: Type.String(),
    name: Type.String(),
    code: Type.Union([Type.String(), Type.Null()]),
    description: Type.Union([Type.String(), Type.Null()]),
    status: ProjectStatusSchema,
    ownerId: Type.Union([Type.String(), Type.Null()]),
    startDate: Type.Union([Type.String(), Type.Null()]),
    endDate: Type.Union([Type.String(), Type.Null()]),
    metadata: Type.Record(Type.String(), Type.Any()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()])
});
// Project with relations schema
export const ProjectWithRelationsSchema = Type.Object({
    id: Type.String(),
    organizationId: Type.String(),
    name: Type.String(),
    code: Type.Union([Type.String(), Type.Null()]),
    description: Type.Union([Type.String(), Type.Null()]),
    status: ProjectStatusSchema,
    ownerId: Type.Union([Type.String(), Type.Null()]),
    startDate: Type.Union([Type.String(), Type.Null()]),
    endDate: Type.Union([Type.String(), Type.Null()]),
    metadata: Type.Record(Type.String(), Type.Any()),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    deletedAt: Type.Union([Type.String({ format: 'date-time' }), Type.Null()]),
    // Relations
    owner: Type.Optional(Type.Object({
        id: Type.String(),
        firstName: Type.String(),
        lastName: Type.String(),
        email: Type.String()
    })),
    serviceCategories: Type.Optional(Type.Array(Type.Object({
        id: Type.String(),
        name: Type.String(),
        code: Type.Union([Type.String(), Type.Null()])
    })))
});
// Pagination metadata schema
export const PaginationMetaSchema = Type.Object({
    page: Type.Number(),
    size: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number(),
    hasNext: Type.Boolean(),
    hasPrev: Type.Boolean()
});
// Projects list response schema
export const ProjectsListResponseSchema = Type.Object({
    data: Type.Array(ProjectSchema),
    meta: PaginationMetaSchema
});
// Project detail response schema
export const ProjectDetailResponseSchema = ProjectWithRelationsSchema;
// Error response schema
export const ProjectErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.Optional(Type.String()),
    details: Type.Optional(Type.Record(Type.String(), Type.Any()))
});
//# sourceMappingURL=typeboxSchemas.js.map