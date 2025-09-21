/**
 * F1A Tenant Admin Portal - TypeBox Schemas
 * Comprehensive validation schemas for tenant management operations
 */

import { Type } from '@sinclair/typebox';
import { StandardErrorResponses } from '../../../lib/schemas/error-envelope.js';

// ===== REQUEST SCHEMAS =====

export const CreateTenantSchema = Type.Object({
  name: Type.String({ 
    minLength: 1, 
    maxLength: 255,
    description: 'Tenant display name'
  }),
  slug: Type.String({ 
    minLength: 1, 
    maxLength: 100, 
    pattern: '^[a-z0-9-]+$',
    description: 'URL-safe tenant identifier'
  }),
  billingEmail: Type.String({ 
    format: 'email',
    description: 'Primary billing contact email'
  }),
  defaultCurrency: Type.String({ 
    minLength: 3, 
    maxLength: 3, 
    pattern: '^[A-Z]{3}$',
    default: 'USD',
    description: 'ISO 4217 currency code'
  }),
  timezone: Type.String({ 
    default: 'UTC',
    description: 'IANA timezone identifier'
  })
}, { additionalProperties: false });

export const UpdateTenantSchema = Type.Partial(Type.Object({
  name: Type.String({ minLength: 1, maxLength: 255 }),
  slug: Type.String({ 
    minLength: 1, 
    maxLength: 100, 
    pattern: '^[a-z0-9-]+$' 
  }),
  billingEmail: Type.String({ format: 'email' }),
  defaultCurrency: Type.String({ 
    minLength: 3, 
    maxLength: 3, 
    pattern: '^[A-Z]{3}$' 
  }),
  timezone: Type.String(),
  status: Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED')
  ])
}), { additionalProperties: false });

export const CreateMembershipSchema = Type.Object({
  userEmail: Type.String({ 
    format: 'email',
    description: 'Email of user to add to tenant'
  }),
  role: Type.Union([
    Type.Literal('OWNER'),
    Type.Literal('ADMIN'),
    Type.Literal('STAFF'),
    Type.Literal('VIEWER')
  ], {
    description: 'Role to assign to user in tenant'
  })
}, { additionalProperties: false });

export const TenantListQuerySchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1, default: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100, default: 20 })),
  search: Type.Optional(Type.String({ maxLength: 255 })),
  status: Type.Optional(Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED'),
    Type.Literal('ALL')
  ])),
  sortBy: Type.Optional(Type.Union([
    Type.Literal('name'),
    Type.Literal('createdAt'),
    Type.Literal('membershipCount')
  ])),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ]))
}, { additionalProperties: false });

// ===== RESPONSE SCHEMAS =====

export const TenantResponseSchema = Type.Object({
  id: Type.String(),
  name: Type.String(),
  slug: Type.String(),
  billingEmail: Type.String(),
  defaultCurrency: Type.String(),
  timezone: Type.String(),
  status: Type.Union([
    Type.Literal('ACTIVE'),
    Type.Literal('SUSPENDED')
  ]),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  membershipCount: Type.Number({ minimum: 0 })
});

export const MembershipResponseSchema = Type.Object({
  id: Type.String(),
  userId: Type.String(),
  userEmail: Type.String(),
  userFirstName: Type.String(),
  userLastName: Type.String(),
  userDisplayName: Type.Optional(Type.String()),
  role: Type.Union([
    Type.Literal('OWNER'),
    Type.Literal('ADMIN'),
    Type.Literal('STAFF'),
    Type.Literal('VIEWER')
  ]),
  createdAt: Type.String({ format: 'date-time' })
});

export const TenantDetailResponseSchema = Type.Object({
  tenant: TenantResponseSchema,
  memberships: Type.Array(MembershipResponseSchema),
  stats: Type.Object({
    totalUsers: Type.Number(),
    activeUsers: Type.Number(),
    totalQuotes: Type.Number(),
    totalInvoices: Type.Number(),
    totalRevenue: Type.String() // Decimal as string for precision
  })
});

export const TenantListResponseSchema = Type.Object({
  data: Type.Array(TenantResponseSchema),
  pagination: Type.Object({
    page: Type.Number({ minimum: 1 }),
    limit: Type.Number({ minimum: 1 }),
    total: Type.Number({ minimum: 0 }),
    totalPages: Type.Number({ minimum: 0 }),
    hasNext: Type.Boolean(),
    hasPrevious: Type.Boolean()
  }),
  meta: Type.Optional(Type.Object({
    searchQuery: Type.Optional(Type.String()),
    statusFilter: Type.Optional(Type.String()),
    sortBy: Type.Optional(Type.String()),
    sortOrder: Type.Optional(Type.String())
  }))
});

export const CreateTenantResponseSchema = Type.Object({
  tenant: TenantResponseSchema,
  message: Type.String()
});

export const UpdateTenantResponseSchema = Type.Object({
  tenant: TenantResponseSchema,
  message: Type.String()
});

export const CreateMembershipResponseSchema = Type.Object({
  membership: MembershipResponseSchema,
  message: Type.String()
});

// ===== ROUTE SCHEMAS =====

export const AdminTenantRouteSchemas = {
  // GET /v1/admin/tenants
  listTenants: {
    querystring: TenantListQuerySchema,
    response: {
      200: TenantListResponseSchema,
      ...StandardErrorResponses
    }
  },
  
  // POST /v1/admin/tenants
  createTenant: {
    body: CreateTenantSchema,
    response: {
      201: CreateTenantResponseSchema,
      ...StandardErrorResponses
    }
  },
  
  // GET /v1/admin/tenants/:id
  getTenant: {
    params: Type.Object({
      id: Type.String()
    }),
    response: {
      200: TenantDetailResponseSchema,
      ...StandardErrorResponses
    }
  },
  
  // PATCH /v1/admin/tenants/:id
  updateTenant: {
    params: Type.Object({
      id: Type.String()
    }),
    body: UpdateTenantSchema,
    response: {
      200: UpdateTenantResponseSchema,
      ...StandardErrorResponses
    }
  },
  
  // POST /v1/admin/tenants/:id/users
  addMembership: {
    params: Type.Object({
      id: Type.String()
    }),
    body: CreateMembershipSchema,
    response: {
      201: CreateMembershipResponseSchema,
      ...StandardErrorResponses
    }
  },
  
  // DELETE /v1/admin/tenants/:id/users/:membershipId
  removeMembership: {
    params: Type.Object({
      id: Type.String(),
      membershipId: Type.String()
    }),
    response: {
      200: Type.Object({
        message: Type.String()
      }),
      ...StandardErrorResponses
    }
  }
};

// ===== TYPE EXPORTS =====

export type CreateTenant = typeof CreateTenantSchema.static;
export type UpdateTenant = typeof UpdateTenantSchema.static;
export type CreateMembership = typeof CreateMembershipSchema.static;
export type TenantListQuery = typeof TenantListQuerySchema.static;
export type TenantResponse = typeof TenantResponseSchema.static;
export type MembershipResponse = typeof MembershipResponseSchema.static;
export type TenantDetailResponse = typeof TenantDetailResponseSchema.static;
export type TenantListResponse = typeof TenantListResponseSchema.static;

