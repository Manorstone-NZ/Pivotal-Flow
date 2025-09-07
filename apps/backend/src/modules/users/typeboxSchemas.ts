import { Type, type Static } from '@sinclair/typebox';

// User creation schema
export const UserCreateSchema = Type.Object({
  email: Type.String({ format: 'email', minLength: 1, maxLength: 255 }),
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  displayName: Type.Optional(Type.String({ maxLength: 200 })),
  phone: Type.Optional(Type.String({ maxLength: 20 })),
  timezone: Type.Optional(Type.String({ maxLength: 50 })),
  locale: Type.Optional(Type.String({ maxLength: 10 }))
});

export type UserCreate = Static<typeof UserCreateSchema>;

// User update schema
export const UserUpdateSchema = Type.Object({
  displayName: Type.Optional(Type.String({ maxLength: 200 })),
  isActive: Type.Optional(Type.Boolean())
});

export type UserUpdate = Static<typeof UserUpdateSchema>;

// User list filters schema
export const UserListFiltersSchema = Type.Object({
  q: Type.Optional(Type.String()),
  isActive: Type.Optional(Type.Boolean()),
  roleId: Type.Optional(Type.String())
});

export type UserListFilters = Static<typeof UserListFiltersSchema>;

// User list sort schema
export const UserListSortSchema = Type.Object({
  field: Type.Union([
    Type.Literal('email'),
    Type.Literal('createdAt')
  ]),
  direction: Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc')
  ])
});

export type UserListSort = Static<typeof UserListSortSchema>;

// User response schema
export const UserResponseSchema = Type.Object({
  id: Type.String(),
  email: Type.String({ format: 'email' }),
  firstName: Type.String(),
  lastName: Type.String(),
  displayName: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  timezone: Type.Optional(Type.String()),
  locale: Type.Optional(Type.String()),
  isActive: Type.Boolean(),
  roles: Type.Array(Type.Object({
    id: Type.String(),
    name: Type.String(),
    description: Type.Optional(Type.String())
  })),
  organizationId: Type.String(),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' })
});

export type UserResponse = Static<typeof UserResponseSchema>;

// User list response schema
export const UserListResponseSchema = Type.Object({
  users: Type.Array(UserResponseSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    totalPages: Type.Number()
  })
});

export type UserListResponse = Static<typeof UserListResponseSchema>;

// Error response schema
export const UserErrorSchema = Type.Object({
  error: Type.String(),
  message: Type.String(),
  code: Type.String()
});

export type UserError = Static<typeof UserErrorSchema>;
