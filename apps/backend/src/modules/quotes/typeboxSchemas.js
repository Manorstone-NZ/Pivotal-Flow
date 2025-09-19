import { Type } from '@sinclair/typebox';
// Quote status enum based on B.1 specification
export const QuoteStatus = {
    DRAFT: 'draft',
    PENDING: 'pending',
    APPROVED: 'approved',
    SENT: 'sent',
    ACCEPTED: 'accepted',
    REJECTED: 'rejected',
    CANCELLED: 'cancelled'
};
// Quote type enum
export const QuoteType = {
    PROJECT: 'project',
    SERVICE: 'service',
    PRODUCT: 'product',
    MAINTENANCE: 'maintenance'
};
// Create Quote Schema
export const CreateQuoteSchema = Type.Object({
    clientId: Type.String(),
    title: Type.String({ minLength: 1, maxLength: 255 }),
    description: Type.Optional(Type.String()),
    type: Type.Union([
        Type.Literal('project'),
        Type.Literal('service'),
        Type.Literal('product'),
        Type.Literal('maintenance')
    ]),
    status: Type.Union([
        Type.Literal('draft'),
        Type.Literal('pending'),
        Type.Literal('approved'),
        Type.Literal('sent'),
        Type.Literal('accepted'),
        Type.Literal('rejected'),
        Type.Literal('cancelled')
    ]),
    validUntil: Type.Optional(Type.String({ format: 'date-time' })),
    metadata: Type.Record(Type.String(), Type.Unknown(), { default: {} })
});
// Update Quote Schema
export const UpdateQuoteSchema = Type.Partial(CreateQuoteSchema);
// Quote Response Schema
export const QuoteResponseSchema = Type.Object({
    id: Type.String(),
    clientId: Type.String(),
    title: Type.String(),
    description: Type.Optional(Type.String()),
    type: Type.String(),
    status: Type.String(),
    validUntil: Type.Optional(Type.String({ format: 'date-time' })),
    metadata: Type.Record(Type.String(), Type.Unknown()),
    organizationId: Type.String(),
    createdAt: Type.String({ format: 'date-time' }),
    updatedAt: Type.String({ format: 'date-time' }),
    lineItems: Type.Array(Type.Object({
        id: Type.String(),
        description: Type.String(),
        quantity: Type.Number(),
        unitPrice: Type.Number(),
        totalPrice: Type.Number(),
        metadata: Type.Record(Type.String(), Type.Unknown())
    })),
    subtotal: Type.Number(),
    taxAmount: Type.Number(),
    totalAmount: Type.Number(),
    createdBy: Type.String(),
    quoteNumber: Type.String()
});
// Error response schema
export const QuoteErrorSchema = Type.Object({
    error: Type.String(),
    message: Type.String(),
    code: Type.String()
});
// Quote List Filters Schema
export const QuoteListFiltersSchema = Type.Object({
    status: Type.Optional(Type.String()),
    customerId: Type.Optional(Type.String()),
    projectId: Type.Optional(Type.String()),
    type: Type.Optional(Type.String()),
    q: Type.Optional(Type.String()),
    validFrom: Type.Optional(Type.String()),
    validUntil: Type.Optional(Type.String()),
    createdBy: Type.Optional(Type.String())
});
// Quote Status Transition Schema
export const QuoteStatusTransitionSchema = Type.Object({
    status: Type.Union([
        Type.Literal('draft'),
        Type.Literal('pending'),
        Type.Literal('approved'),
        Type.Literal('sent'),
        Type.Literal('accepted'),
        Type.Literal('rejected'),
        Type.Literal('cancelled')
    ]),
    reason: Type.Optional(Type.String())
});
//# sourceMappingURL=typeboxSchemas.js.map