/**
 * Customer Module Validation Schemas
 * Zod schemas for request/response validation
 */
import { z } from 'zod';
import { Type } from '@sinclair/typebox';
// Zod schemas for runtime validation
export const CreateCustomerSchema = z.object({
    companyName: z.string().min(1, 'Company name is required').max(255),
    legalName: z.string().max(255).optional(),
    industry: z.string().max(100).optional(),
    website: z.string().url('Invalid URL').optional().or(z.literal('')),
    description: z.string().optional(),
    customerType: z.enum(['business', 'individual']).default('business'),
    source: z.string().max(50).optional(),
    tags: z.array(z.string()).optional(),
    rating: z.number().int().min(1).max(5).optional(),
    // Address fields
    street: z.string().optional(),
    suburb: z.string().optional(),
    city: z.string().optional(),
    region: z.string().optional(),
    postcode: z.string().optional(),
    country: z.string().optional(),
    // Contact fields
    phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    contactExtras: z.any().optional(),
});
export const UpdateCustomerSchema = CreateCustomerSchema.partial();
export const CreateContactSchema = z.object({
    firstName: z.string().min(1, 'First name is required').max(100),
    lastName: z.string().min(1, 'Last name is required').max(100),
    email: z.string().email('Invalid email').optional().or(z.literal('')),
    phone: z.string().regex(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number').optional().or(z.literal('')),
    position: z.string().max(100).optional(),
    department: z.string().max(100).optional(),
    isPrimary: z.boolean().default(false),
    notes: z.string().optional(),
    contactExtras: z.any().optional(),
});
export const UpdateContactSchema = CreateContactSchema.partial();
export const CustomerQuerySchema = z.object({
    page: z.coerce.number().min(1).default(1),
    limit: z.coerce.number().min(1).max(100).default(20),
    search: z.string().optional(),
    status: z.enum(['active', 'inactive', 'prospect']).optional(),
    customerType: z.enum(['business', 'individual']).optional(),
    industry: z.string().optional(),
    source: z.string().optional(),
    tags: z.array(z.string()).optional(),
    sortBy: z.string().optional(),
    sortOrder: z.enum(['asc', 'desc']).default('desc'),
});
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
//# sourceMappingURL=schemas.js.map