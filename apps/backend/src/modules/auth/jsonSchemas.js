// apps/backend/src/modules/auth/jsonSchemas.ts
export const loginJsonSchema = {
    body: {
        type: "object",
        required: ["email", "password"],
        additionalProperties: false,
        properties: {
            email: { type: "string", format: "email" },
            password: { type: "string", minLength: 12 }
        }
    },
    response: {
        200: {
            type: "object",
            required: ["accessToken", "user"],
            additionalProperties: false,
            properties: {
                accessToken: { type: "string" },
                user: {
                    type: "object",
                    required: ["id", "email", "displayName", "roles", "organizationId"],
                    additionalProperties: false,
                    properties: {
                        id: { type: "string" },
                        email: { type: "string", format: "email" },
                        displayName: { type: "string" },
                        roles: { type: "array", items: { type: "string" } },
                        organizationId: { type: "string" }
                    }
                }
            }
        },
        401: {
            type: "object",
            required: ["error", "message", "code"],
            additionalProperties: false,
            properties: {
                error: { type: "string" },
                message: { type: "string" },
                code: { type: "string" }
            }
        },
        500: {
            type: "object",
            required: ["error", "message", "code"],
            additionalProperties: false,
            properties: {
                error: { type: "string" },
                message: { type: "string" },
                code: { type: "string" }
            }
        }
    },
    tags: ["auth"]
};
export const refreshJsonSchema = {
    body: {
        type: "object",
        required: [],
        additionalProperties: false,
        properties: {
            refreshToken: { type: "string" }
        }
    },
    response: {
        200: {
            type: "object",
            required: ["accessToken"],
            additionalProperties: false,
            properties: {
                accessToken: { type: "string" }
            }
        },
        401: {
            type: "object",
            required: ["error", "message", "code"],
            additionalProperties: false,
            properties: {
                error: { type: "string" },
                message: { type: "string" },
                code: { type: "string" }
            }
        }
    },
    tags: ["auth"]
};
export const logoutJsonSchema = {
    response: {
        200: {
            type: "object",
            required: ["message"],
            additionalProperties: false,
            properties: {
                message: { type: "string" }
            }
        }
    },
    tags: ["auth"]
};
export const meJsonSchema = {
    response: {
        200: {
            type: "object",
            required: ["id", "email", "displayName", "roles", "organizationId"],
            additionalProperties: false,
            properties: {
                id: { type: "string" },
                email: { type: "string", format: "email" },
                displayName: { type: "string" },
                roles: { type: "array", items: { type: "string" } },
                organizationId: { type: "string" }
            }
        },
        401: {
            type: "object",
            required: ["error", "message", "code"],
            additionalProperties: false,
            properties: {
                error: { type: "string" },
                message: { type: "string" },
                code: { type: "string" }
            }
        },
        500: {
            type: "object",
            required: ["error", "message", "code"],
            additionalProperties: false,
            properties: {
                error: { type: "string" },
                message: { type: "string" },
                code: { type: "string" }
            }
        }
    },
    tags: ["auth"]
};
//# sourceMappingURL=jsonSchemas.js.map