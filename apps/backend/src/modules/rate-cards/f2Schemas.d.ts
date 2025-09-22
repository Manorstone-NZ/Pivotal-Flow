import { type Static } from '@sinclair/typebox';
export declare const UnitOfMeasureSchema: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"hour">, import("@sinclair/typebox").TLiteral<"day">, import("@sinclair/typebox").TLiteral<"fixed">]>;
export type UnitOfMeasure = Static<typeof UnitOfMeasureSchema>;
export declare const CreateRateCardSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TString;
    isActive: import("@sinclair/typebox").TBoolean;
}>;
export type CreateRateCard = Static<typeof CreateRateCardSchema>;
export declare const UpdateRateCardSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type UpdateRateCard = Static<typeof UpdateRateCardSchema>;
export declare const CreateServiceSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    unitOfMeasure: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"hour">, import("@sinclair/typebox").TLiteral<"day">, import("@sinclair/typebox").TLiteral<"fixed">]>;
    buyPrice: import("@sinclair/typebox").TNumber;
    sellPrice: import("@sinclair/typebox").TNumber;
    taxClass: import("@sinclair/typebox").TString;
    isActive: import("@sinclair/typebox").TBoolean;
    sortOrder: import("@sinclair/typebox").TNumber;
}>;
export type CreateService = Static<typeof CreateServiceSchema>;
export declare const UpdateServiceSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    unitOfMeasure: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"hour">, import("@sinclair/typebox").TLiteral<"day">, import("@sinclair/typebox").TLiteral<"fixed">]>>;
    buyPrice: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    sellPrice: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    taxClass: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    sortOrder: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
}>;
export type UpdateService = Static<typeof UpdateServiceSchema>;
export declare const ServiceResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    rateCardId: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    unitOfMeasure: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"hour">, import("@sinclair/typebox").TLiteral<"day">, import("@sinclair/typebox").TLiteral<"fixed">]>;
    buyPrice: import("@sinclair/typebox").TNumber;
    sellPrice: import("@sinclair/typebox").TNumber;
    taxClass: import("@sinclair/typebox").TString;
    isActive: import("@sinclair/typebox").TBoolean;
    sortOrder: import("@sinclair/typebox").TNumber;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type ServiceResponse = Static<typeof ServiceResponseSchema>;
export declare const RateCardResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
    currency: import("@sinclair/typebox").TString;
    isActive: import("@sinclair/typebox").TBoolean;
    services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        rateCardId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        unitOfMeasure: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"hour">, import("@sinclair/typebox").TLiteral<"day">, import("@sinclair/typebox").TLiteral<"fixed">]>;
        buyPrice: import("@sinclair/typebox").TNumber;
        sellPrice: import("@sinclair/typebox").TNumber;
        taxClass: import("@sinclair/typebox").TString;
        isActive: import("@sinclair/typebox").TBoolean;
        sortOrder: import("@sinclair/typebox").TNumber;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type RateCardResponse = Static<typeof RateCardResponseSchema>;
export declare const RateCardListResponseSchema: import("@sinclair/typebox").TObject<{
    rateCards: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        organizationId: import("@sinclair/typebox").TString;
        name: import("@sinclair/typebox").TString;
        description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
        currency: import("@sinclair/typebox").TString;
        isActive: import("@sinclair/typebox").TBoolean;
        services: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
            id: import("@sinclair/typebox").TString;
            rateCardId: import("@sinclair/typebox").TString;
            name: import("@sinclair/typebox").TString;
            description: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TString, import("@sinclair/typebox").TNull]>;
            unitOfMeasure: import("@sinclair/typebox").TUnion<[import("@sinclair/typebox").TLiteral<"hour">, import("@sinclair/typebox").TLiteral<"day">, import("@sinclair/typebox").TLiteral<"fixed">]>;
            buyPrice: import("@sinclair/typebox").TNumber;
            sellPrice: import("@sinclair/typebox").TNumber;
            taxClass: import("@sinclair/typebox").TString;
            isActive: import("@sinclair/typebox").TBoolean;
            sortOrder: import("@sinclair/typebox").TNumber;
            createdAt: import("@sinclair/typebox").TString;
            updatedAt: import("@sinclair/typebox").TString;
        }>>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
    total: import("@sinclair/typebox").TNumber;
    page: import("@sinclair/typebox").TNumber;
    limit: import("@sinclair/typebox").TNumber;
}>;
export type RateCardListResponse = Static<typeof RateCardListResponseSchema>;
export declare const RateCardListQuerySchema: import("@sinclair/typebox").TObject<{
    page: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    limit: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    search: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
}>;
export type RateCardListQuery = Static<typeof RateCardListQuerySchema>;
export declare const RateCardErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type RateCardError = Static<typeof RateCardErrorSchema>;
//# sourceMappingURL=f2Schemas.d.ts.map