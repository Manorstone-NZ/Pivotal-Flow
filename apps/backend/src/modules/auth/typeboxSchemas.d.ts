import { type Static } from '@sinclair/typebox';
export declare const LoginRequestSchema: import("@sinclair/typebox").TObject<{
    email: import("@sinclair/typebox").TString;
    password: import("@sinclair/typebox").TString;
}>;
export declare const LoginResponseSchema: import("@sinclair/typebox").TObject<{
    accessToken: import("@sinclair/typebox").TString;
    user: import("@sinclair/typebox").TObject<{
        id: import("@sinclair/typebox").TString;
        email: import("@sinclair/typebox").TString;
        displayName: import("@sinclair/typebox").TString;
        roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
        organizationId: import("@sinclair/typebox").TString;
    }>;
}>;
export declare const RefreshRequestSchema: import("@sinclair/typebox").TObject<{
    refreshToken: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
}>;
export declare const RefreshResponseSchema: import("@sinclair/typebox").TObject<{
    accessToken: import("@sinclair/typebox").TString;
}>;
export declare const LogoutResponseSchema: import("@sinclair/typebox").TObject<{
    message: import("@sinclair/typebox").TString;
}>;
export declare const MeResponseSchema: import("@sinclair/typebox").TObject<{
    id: import("@sinclair/typebox").TString;
    email: import("@sinclair/typebox").TString;
    displayName: import("@sinclair/typebox").TString;
    roles: import("@sinclair/typebox").TArray<import("@sinclair/typebox").TString>;
    organizationId: import("@sinclair/typebox").TString;
}>;
export declare const AuthErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TString;
    message: import("@sinclair/typebox").TString;
    code: import("@sinclair/typebox").TString;
}>;
export type LoginRequest = Static<typeof LoginRequestSchema>;
export type LoginResponse = Static<typeof LoginResponseSchema>;
export type RefreshRequest = Static<typeof RefreshRequestSchema>;
export type RefreshResponse = Static<typeof RefreshResponseSchema>;
export type LogoutResponse = Static<typeof LogoutResponseSchema>;
export type MeResponse = Static<typeof MeResponseSchema>;
export type AuthError = Static<typeof AuthErrorSchema>;
//# sourceMappingURL=typeboxSchemas.d.ts.map