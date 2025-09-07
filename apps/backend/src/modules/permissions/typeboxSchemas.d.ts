import { type Static } from '@sinclair/typebox';
export declare const PermissionResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    name: import("@sinclair/typebox").TString;
    description: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    resource: import("@sinclair/typebox").TString;
    action: import("@sinclair/typebox").TString;
    organizationId: import("@sinclair/typebox").TString;
    createdAt: import("@sinclair/typebox").TString;
    updatedAt: import("@sinclair/typebox").TString;
}>;
export type PermissionResponse = Static<typeof PermissionResponseSchema>;
export declare const PermissionErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type PermissionError = Static<typeof PermissionErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map