import { type Static } from '@sinclair/typebox';
export declare const CreateRateCardSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TString;
    effectiveFrom: import("@sinclair/typebox").TString;
    effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isDefault: import("@sinclair/typebox").TBoolean;
    isActive: import("@sinclair/typebox").TBoolean;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
}>;
export type CreateRateCard = Static<typeof CreateRateCardSchema>;
export declare const UpdateRateCardSchema: import("@sinclair/typebox").TObject<{
    name: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    effectiveFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isDefault: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
}>;
export type UpdateRateCard = Static<typeof UpdateRateCardSchema>;
export declare const CreateRateCardItemSchema: import("@sinclair/typebox").TObject<{
    rateCardId: import("@sinclair/typebox").TString;
    serviceCategoryId: import("@sinclair/typebox").TString;
    roleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    baseRate: import("@sinclair/typebox").TNumber;
    currency: import("@sinclair/typebox").TString;
    effectiveFrom: import("@sinclair/typebox").TString;
    effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TBoolean;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
}>;
export type CreateRateCardItem = Static<typeof CreateRateCardItemSchema>;
export declare const UpdateRateCardItemSchema: import("@sinclair/typebox").TObject<{
    rateCardId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    serviceCategoryId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    roleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    baseRate: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TNumber>;
    currency: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    effectiveFrom: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TBoolean>;
    metadata: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>>;
}>;
export type UpdateRateCardItem = Static<typeof UpdateRateCardItemSchema>;
export declare const RateCardResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    currency: import("@sinclair/typebox").TString;
    effectiveFrom: import("@sinclair/typebox").TString;
    effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isDefault: import("@sinclair/typebox").TBoolean;
    isActive: import("@sinclair/typebox").TBoolean;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    organizationId: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
    items: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        serviceCategoryId: import("@sinclair/typebox").TString;
        roleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        baseRate: import("@sinclair/typebox").TNumber;
        currency: import("@sinclair/typebox").TString;
        effectiveFrom: import("@sinclair/typebox").TString;
        effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        isActive: import("@sinclair/typebox").TBoolean;
        metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
        createdAt: import("@sinclair/typebox").TString;
        updatedAt: import("@sinclair/typebox").TString;
    }>>;
}>;
export type RateCardResponse = Static<typeof RateCardResponseSchema>;
export declare const RateCardItemResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    rateCardId: import("@sinclair/typebox").TString;
    serviceCategoryId: import("@sinclair/typebox").TString;
    roleId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    baseRate: import("@sinclair/typebox").TNumber;
    currency: import("@sinclair/typebox").TString;
    effectiveFrom: import("@sinclair/typebox").TString;
    effectiveUntil: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    isActive: import("@sinclair/typebox").TBoolean;
    metadata: import("@sinclair/typebox").TRecord<import("@sinclair/typebox").TString, import("@sinclair/typebox").TUnknown>;
    organizationId: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type RateCardItemResponse = Static<typeof RateCardItemResponseSchema>;
export declare const RateCardErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type RateCardError = Static<typeof RateCardErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map