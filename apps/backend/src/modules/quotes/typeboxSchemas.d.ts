import { type Static } from '@sinclair/typebox';
export declare const QuoteStatus: {
    readonly DRAFT: "draft";
    readonly PENDING: "pending";
    readonly APPROVED: "approved";
    readonly SENT: "sent";
    readonly ACCEPTED: "accepted";
    readonly REJECTED: "rejected";
    readonly CANCELLED: "cancelled";
};
export type QuoteStatus = typeof QuoteStatus[keyof typeof QuoteStatus];
export declare const QuoteType: {
    readonly PROJECT: "project";
    readonly SERVICE: "service";
    readonly PRODUCT: "product";
    readonly MAINTENANCE: "maintenance";
};
export type QuoteType = typeof QuoteType[keyof typeof QuoteType];
export declare const CreateQuoteSchema: import("@sinclair/typebox").TObject<{
    clientId: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    type: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"project">, import("@sinclair/typebox").TLiteral<"service">, import("@sinclair/typebox").TLiteral<"product">, import("@sinclair/typebox").TLiteral<"maintenance">]>;
    status: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"cancelled">]>;
    validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
}>;
export type CreateQuote = Static<typeof CreateQuoteSchema>;
export declare const UpdateQuoteSchema: import("@sinclair/typebox").TObject<{
    clientId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    title: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    type: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"project">, import("@sinclair/typebox").TLiteral<"service">, import("@sinclair/typebox").TLiteral<"product">, import("@sinclair/typebox").TLiteral<"maintenance">]>>;
    status: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"draft">, import("@sinclair/typebox").TLiteral<"pending">, import("@sinclair/typebox").TLiteral<"approved">, import("@sinclair/typebox").TLiteral<"sent">, import("@sinclair/typebox").TLiteral<"accepted">, import("@sinclair/typebox").TLiteral<"rejected">, import("@sinclair/typebox").TLiteral<"cancelled">]>>;
    validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
}>;
export type UpdateQuote = Static<typeof UpdateQuoteSchema>;
export declare const QuoteResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    clientId: import("@sinclair/typebox").TString;
    title: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    type: import("@sinclair/typebox").TString;
    status: import("@sinclair/typebox").TString;
    validUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    organizationId: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    lineItems: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TString;
        quantity: import("@sinclair/typebox").TNumber;
        unitPrice: import("@sinclair/typebox").TNumber;
        totalPrice: import("@sinclair/typebox").TNumber;
        metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    }>>;
    subtotal: import("@sinclair/typebox").TNumber;
    taxAmount: import("@sinclair/typebox").TNumber;
    totalAmount: import("@sinclair/typebox").TNumber;
    createdBy: import("@sinclair/typebox").TString;
    quoteNumber: import("@sinclair/typebox").TString;
}>;
export type QuoteResponse = Static<typeof QuoteResponseSchema>;
export declare const QuoteErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type QuoteError = Static<typeof QuoteErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map