export declare const loginJsonSchema: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly ["email", "password"];
        readonly additionalProperties: false;
        readonly properties: {
            readonly email: {
                readonly type: "string";
                readonly format: "email";
            };
            readonly password: {
                readonly type: "string";
                readonly minLength: 12;
            };
        };
    };
    readonly response: {
        readonly 200: {
            readonly type: "object";
            readonly required: readonly ["accessToken", "user"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly accessToken: {
                    readonly type: "string";
                };
                readonly user: {
                    readonly type: "object";
                    readonly required: readonly ["id", "email", "displayName", "roles", "organizationId"];
                    readonly additionalProperties: false;
                    readonly properties: {
                        readonly id: {
                            readonly type: "string";
                        };
                        readonly email: {
                            readonly type: "string";
                            readonly format: "email";
                        };
                        readonly displayName: {
                            readonly type: "string";
                        };
                        readonly roles: {
                            readonly type: "array";
                            readonly items: {
                                readonly type: "string";
                            };
                        };
                        readonly organizationId: {
                            readonly type: "string";
                        };
                    };
                };
            };
        };
        readonly 401: {
            readonly type: "object";
            readonly required: readonly ["error", "message", "code"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly error: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                };
                readonly code: {
                    readonly type: "string";
                };
            };
        };
        readonly 500: {
            readonly type: "object";
            readonly required: readonly ["error", "message", "code"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly error: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                };
                readonly code: {
                    readonly type: "string";
                };
            };
        };
    };
    readonly tags: readonly ["auth"];
};
export declare const refreshJsonSchema: {
    readonly body: {
        readonly type: "object";
        readonly required: readonly [];
        readonly additionalProperties: false;
        readonly properties: {
            readonly refreshToken: {
                readonly type: "string";
            };
        };
    };
    readonly response: {
        readonly 200: {
            readonly type: "object";
            readonly required: readonly ["accessToken"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly accessToken: {
                    readonly type: "string";
                };
            };
        };
        readonly 401: {
            readonly type: "object";
            readonly required: readonly ["error", "message", "code"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly error: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                };
                readonly code: {
                    readonly type: "string";
                };
            };
        };
    };
    readonly tags: readonly ["auth"];
};
export declare const logoutJsonSchema: {
    readonly response: {
        readonly 200: {
            readonly type: "object";
            readonly required: readonly ["message"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly message: {
                    readonly type: "string";
                };
            };
        };
    };
    readonly tags: readonly ["auth"];
};
export declare const meJsonSchema: {
    readonly response: {
        readonly 200: {
            readonly type: "object";
            readonly required: readonly ["id", "email", "displayName", "roles", "organizationId"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly id: {
                    readonly type: "string";
                };
                readonly email: {
                    readonly type: "string";
                    readonly format: "email";
                };
                readonly displayName: {
                    readonly type: "string";
                };
                readonly roles: {
                    readonly type: "array";
                    readonly items: {
                        readonly type: "string";
                    };
                };
                readonly organizationId: {
                    readonly type: "string";
                };
            };
        };
        readonly 401: {
            readonly type: "object";
            readonly required: readonly ["error", "message", "code"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly error: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                };
                readonly code: {
                    readonly type: "string";
                };
            };
        };
        readonly 500: {
            readonly type: "object";
            readonly required: readonly ["error", "message", "code"];
            readonly additionalProperties: false;
            readonly properties: {
                readonly error: {
                    readonly type: "string";
                };
                readonly message: {
                    readonly type: "string";
                };
                readonly code: {
                    readonly type: "string";
                };
            };
        };
    };
    readonly tags: readonly ["auth"];
};
//# sourceMappingURL=jsonSchemas.d.ts.map