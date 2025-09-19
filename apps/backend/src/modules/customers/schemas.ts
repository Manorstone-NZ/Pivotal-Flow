/**
 * Customer Module Validation Schemas
 * TypeBox schemas for request/response validation
 */

import { Type } from '@sinclair/typebox';

// TypeBox schemas for OpenAPI documentation
export const CustomerResponseSchema = Type.Object({
  id: Type.String(),
  organizationId: Type.String(),
  customerNumber: Type.String(),
  companyName: Type.String(),
  legalName: Type.Optional(Type.String()),
  industry: Type.Optional(Type.String()),
  website: Type.Optional(Type.String()),
  description: Type.Optional(Type.String()),
  status: Type.String(),
  customerType: Type.String(),
  source: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  rating: Type.Optional(Type.Number()),
  street: Type.Optional(Type.String()),
  suburb: Type.Optional(Type.String()),
  city: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  postcode: Type.Optional(Type.String()),
  country: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String()),
  contactExtras: Type.Optional(Type.Any()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  deletedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export const ContactResponseSchema = Type.Object({
  id: Type.String(),
  customerId: Type.String(),
  organizationId: Type.String(),
  firstName: Type.String(),
  lastName: Type.String(),
  email: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  position: Type.Optional(Type.String()),
  department: Type.Optional(Type.String()),
  isPrimary: Type.Boolean(),
  notes: Type.Optional(Type.String()),
  contactExtras: Type.Optional(Type.Any()),
  createdAt: Type.String({ format: 'date-time' }),
  updatedAt: Type.String({ format: 'date-time' }),
  deletedAt: Type.Optional(Type.String({ format: 'date-time' })),
});

export const CustomerListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(CustomerResponseSchema),
  pagination: Type.Object({
    page: Type.Number(),
    limit: Type.Number(),
    total: Type.Number(),
    pages: Type.Number(),
  }),
});

export const CustomerDetailResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Intersect([
    CustomerResponseSchema,
    Type.Object({
      contacts: Type.Optional(Type.Array(ContactResponseSchema)),
    }),
  ]),
});

export const ContactListResponseSchema = Type.Object({
  success: Type.Boolean(),
  data: Type.Array(ContactResponseSchema),
});

export const StandardSuccessResponseSchema = Type.Object({
  success: Type.Boolean(),
  message: Type.Optional(Type.String()),
});

export const ErrorResponseSchema = Type.Object({
  success: Type.Literal(false),
  error: Type.String(),
  message: Type.String(),
  code: Type.Optional(Type.String()),
  details: Type.Optional(Type.Any()),
});

// Parameter schemas
export const CustomerIdParamSchema = Type.Object({
  id: Type.String(),
});

export const ContactIdParamSchema = Type.Object({
  id: Type.String(),
  contactId: Type.String(),
});

export const CustomerQuerystringSchema = Type.Object({
  page: Type.Optional(Type.Number({ minimum: 1 })),
  limit: Type.Optional(Type.Number({ minimum: 1, maximum: 100 })),
  search: Type.Optional(Type.String()),
  status: Type.Optional(Type.Union([
    Type.Literal('active'),
    Type.Literal('inactive'),
    Type.Literal('prospect'),
  ])),
  customerType: Type.Optional(Type.Union([
    Type.Literal('business'),
    Type.Literal('individual'),
  ])),
  industry: Type.Optional(Type.String()),
  source: Type.Optional(Type.String()),
  tags: Type.Optional(Type.Array(Type.String())),
  sortBy: Type.Optional(Type.String()),
  sortOrder: Type.Optional(Type.Union([
    Type.Literal('asc'),
    Type.Literal('desc'),
  ])),
});

export const CreateCustomerBodySchema = Type.Object({
  companyName: Type.String({ minLength: 1, maxLength: 255 }),
  legalName: Type.Optional(Type.String({ maxLength: 255 })),
  industry: Type.Optional(Type.String({ maxLength: 100 })),
  website: Type.Optional(Type.String({ format: 'uri' })),
  description: Type.Optional(Type.String()),
  customerType: Type.Optional(Type.Union([
    Type.Literal('business'),
    Type.Literal('individual'),
  ])),
  source: Type.Optional(Type.String({ maxLength: 50 })),
  tags: Type.Optional(Type.Array(Type.String())),
  rating: Type.Optional(Type.Number({ minimum: 1, maximum: 5 })),
  street: Type.Optional(Type.String()),
  suburb: Type.Optional(Type.String()),
  city: Type.Optional(Type.String()),
  region: Type.Optional(Type.String()),
  postcode: Type.Optional(Type.String()),
  country: Type.Optional(Type.String()),
  phone: Type.Optional(Type.String()),
  email: Type.Optional(Type.String({ format: 'email' })),
  contactExtras: Type.Optional(Type.Any()),
});

export const UpdateCustomerBodySchema = Type.Partial(CreateCustomerBodySchema);

export const CreateContactBodySchema = Type.Object({
  firstName: Type.String({ minLength: 1, maxLength: 100 }),
  lastName: Type.String({ minLength: 1, maxLength: 100 }),
  email: Type.Optional(Type.String({ format: 'email' })),
  phone: Type.Optional(Type.String()),
  position: Type.Optional(Type.String({ maxLength: 100 })),
  department: Type.Optional(Type.String({ maxLength: 100 })),
  isPrimary: Type.Optional(Type.Boolean()),
  notes: Type.Optional(Type.String()),
  contactExtras: Type.Optional(Type.Any()),
});

export const UpdateContactBodySchema = Type.Partial(CreateContactBodySchema);
