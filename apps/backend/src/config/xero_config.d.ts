/**
 * Xero configuration shim
 * Provides typed configuration object with optional fields
 * Validation will be added in CZ2
 */
export interface XeroConfig {
    enabled: boolean;
    clientId?: string | undefined;
    clientSecret?: string | undefined;
    redirectUri?: string | undefined;
    tenantId?: string | undefined;
    webhookKey?: string | undefined;
}
export declare const xeroConfig: XeroConfig;
export declare function getXeroConfig(): XeroConfig;
export declare function isXeroConfigured(): boolean;
//# sourceMappingURL=xero_config.d.ts.map