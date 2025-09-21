/**
 * Standardized Error Envelope Schemas for F1.5
 * All API endpoints must use these error response formats
 */
export declare const ErrorEnvelopeSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TString;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        request_id: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>;
    meta: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        api_version: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        documentation_url: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export declare const BadRequestErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    }>;
}>;
export declare const UnauthorizedErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    }>;
}>;
export declare const ForbiddenErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    }>;
}>;
export declare const NotFoundErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    }>;
}>;
export declare const ConflictErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    }>;
}>;
export declare const InternalServerErrorSchema: import("@sinclair/typebox").TObject<{
    error: import("@sinclair/typebox").TObject<{
        code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
        message: import("@sinclair/typebox").TString;
        details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
    }>;
}>;
export declare const StandardErrorResponses: {
    400: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TObject<{
            code: import("@sinclair/typebox").TLiteral<"VALIDATION_ERROR">;
            message: import("@sinclair/typebox").TString;
            details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        }>;
    }>;
    401: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TObject<{
            code: import("@sinclair/typebox").TLiteral<"AUTHENTICATION_ERROR">;
            message: import("@sinclair/typebox").TString;
            details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        }>;
    }>;
    403: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TObject<{
            code: import("@sinclair/typebox").TLiteral<"AUTHORIZATION_ERROR">;
            message: import("@sinclair/typebox").TString;
            details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        }>;
    }>;
    404: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TObject<{
            code: import("@sinclair/typebox").TLiteral<"NOT_FOUND">;
            message: import("@sinclair/typebox").TString;
            details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        }>;
    }>;
    409: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TObject<{
            code: import("@sinclair/typebox").TLiteral<"CONFLICT_ERROR">;
            message: import("@sinclair/typebox").TString;
            details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        }>;
    }>;
    500: import("@sinclair/typebox").TObject<{
        error: import("@sinclair/typebox").TObject<{
            code: import("@sinclair/typebox").TLiteral<"INTERNAL_ERROR">;
            message: import("@sinclair/typebox").TString;
            details: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TAny>;
        }>;
    }>;
};
export declare const SuccessEnvelopeSchema: <T extends import("@sinclair/typebox").TSchema>(dataSchema: T) => import("@sinclair/typebox").TObject<{
    data: T;
    meta: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        requestId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        apiVersion: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export declare const PaginatedResponseSchema: <T extends import("@sinclair/typebox").TSchema>(itemSchema: T) => import("@sinclair/typebox").TObject<{
    data: import("@sinclair/typebox").TArray<T>;
    pagination: import("@sinclair/typebox").TObject<{
        page: import("@sinclair/typebox").TNumber;
        pageSize: import("@sinclair/typebox").TNumber;
        total: import("@sinclair/typebox").TNumber;
        totalPages: import("@sinclair/typebox").TNumber;
        hasNext: import("@sinclair/typebox").TBoolean;
        hasPrevious: import("@sinclair/typebox").TBoolean;
    }>;
    meta: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TObject<{
        requestId: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        timestamp: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
        apiVersion: import("@sinclair/typebox").TOptional<import("@sinclair/typebox").TString>;
    }>>;
}>;
export type ErrorEnvelope = typeof ErrorEnvelopeSchema.static;
export type BadRequestError = typeof BadRequestErrorSchema.static;
export type UnauthorizedError = typeof UnauthorizedErrorSchema.static;
export type ForbiddenError = typeof ForbiddenErrorSchema.static;
export type NotFoundError = typeof NotFoundErrorSchema.static;
export type ConflictError = typeof ConflictErrorSchema.static;
export type InternalServerError = typeof InternalServerErrorSchema.static;
//# sourceMappingURL=error-envelope.d.ts.map