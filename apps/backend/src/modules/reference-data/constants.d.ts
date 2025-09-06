/**
 * Reference data constants
 * Configuration and cache settings for reference data endpoints
 */
import type { ReferenceEndpointConfig } from './types.js';
export declare const CACHE_TTL: {
    readonly CURRENCIES: 300;
    readonly TAX_CLASSES: 300;
    readonly ROLES: 600;
    readonly PERMISSIONS: 600;
    readonly SERVICE_CATEGORIES: 300;
    readonly RATE_CARDS: 300;
};
export declare const CACHE_KEY_PREFIXES: {
    readonly CURRENCIES: "ref:currencies";
    readonly TAX_CLASSES: "ref:tax_classes";
    readonly ROLES: "ref:roles";
    readonly PERMISSIONS: "ref:permissions";
    readonly SERVICE_CATEGORIES: "ref:service_categories";
    readonly RATE_CARDS: "ref:rate_cards";
};
export declare const REFERENCE_ENDPOINTS: Record<string, ReferenceEndpointConfig>;
export declare const REFERENCE_METRICS: {
    readonly CACHE_HIT: "pivotal_reference_cache_hit_total";
    readonly CACHE_MISS: "pivotal_reference_cache_miss_total";
    readonly CACHE_BUST: "pivotal_reference_cache_bust_total";
    readonly ENDPOINT_REQUEST: "pivotal_reference_endpoint_request_total";
    readonly ENDPOINT_DURATION: "pivotal_reference_endpoint_duration_seconds";
};
export declare const REFERENCE_ERRORS: {
    readonly CACHE_ERROR: "Cache operation failed";
    readonly PERMISSION_DENIED: "Permission denied for reference data";
    readonly DATA_NOT_FOUND: "Reference data not found";
    readonly INVALID_ENDPOINT: "Invalid reference endpoint";
};
//# sourceMappingURL=constants.d.ts.map